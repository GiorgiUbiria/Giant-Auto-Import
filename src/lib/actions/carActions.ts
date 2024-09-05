"use server";

import { desc, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "../drizzle/db";
import {
  cars,
  images,
  insertCarSchema,
  selectCarSchema,
} from "../drizzle/schema";
import {
  auctionData,
  oceanShippingRates,
  parseVirtualBidData,
  styleToJson,
} from "../utils";
import { authedProcedure, isAdminProcedure } from "./authProcedures";
import { deleteObjectFromBucket } from "./bucketActions";

const AddCarSchema = insertCarSchema.omit({ id: true, destinationPort: true });
const SelectSchema = selectCarSchema;
const Uint8ArraySchema = z
  .array(z.number())
  .transform((arr) => new Uint8Array(arr));

const calculateAuctionFee = (feeData: any[], purchaseFee: number): number => {
  for (const entry of feeData) {
    const isInRange =
      purchaseFee >= entry.minPrice &&
      (typeof entry.maxPrice === "string" || purchaseFee <= entry.maxPrice);

    if (isInRange) {
      if (typeof entry.fee === "string") {
        return (purchaseFee * parseFloat(entry.fee)) / 100;
      } else {
        return entry.fee;
      }
    }
  }
  return 0;
};

const calculateVirtualBidFee = (
  feeData: any[],
  purchasePrice: number
): number => {
  for (const entry of feeData) {
    if (purchasePrice >= entry.minPrice && purchasePrice <= entry.maxPrice) {
      return entry.fee;
    }
  }
  return 0;
};

function calculateCarFees(
  auction: string,
  auctionLocation: string,
  port: string,
  body: string,
  fuel: string,
  purchaseFee: number,
  insurance: "YES" | "NO",
  owner?: string
) {
  const styleData = styleToJson("a");
  const auctionFee = calculateAuctionFee(styleData, purchaseFee);
  const gateFee = 79;
  const titleFee = 20;
  const environmentalFee = 10;
  const virtualBidData = parseVirtualBidData();
  const virtualBidFee = calculateVirtualBidFee(virtualBidData, purchaseFee);

  const totalPurchaseFee =
    purchaseFee +
    auctionFee +
    gateFee +
    titleFee +
    environmentalFee +
    virtualBidFee;

  const groundFee =
    auctionData.find(
      (data) =>
        data.auction === auction && data.auctionLocation === auctionLocation
    )?.rate || 0;
  const oceanFee =
    oceanShippingRates.find((rate) => rate.shorthand === port)?.rate || 0;
  const extraFeePickUp = body === "PICKUP" ? 300 : 0;
  const extraFeeHybrid = fuel === "HYBRID_ELECTRIC" ? 150 : 0;

  const shippingFee = groundFee + oceanFee + extraFeePickUp + extraFeeHybrid;

  let totalFee = totalPurchaseFee + shippingFee;

  if (insurance === "YES") {
    totalFee = totalFee + (totalFee * 1.5) / 100;
  }

  return {
    totalFee: totalFee,
    shippingFee: shippingFee,
    auctionFee: auctionFee,
    gateFee: gateFee,
    titleFee: titleFee,
    environmentalFee: environmentalFee,
    virtualBidFee: virtualBidFee,
    groundFee: groundFee,
    oceanFee: oceanFee,
  };
}

export const addCarAction = isAdminProcedure
  .createServerAction()
  .input(
    z.object({
      ...AddCarSchema.shape,
      images: z
        .array(
          z.object({
            buffer: Uint8ArraySchema,
            size: z.number(),
            name: z.string(),
            type: z.enum(["AUCTION", "WAREHOUSE", "DELIVERED", "PICK_UP"]),
          })
        )
        .optional(),
    })
  )
  .output(
    z.object({
      message: z.string().optional(),
      data: z.any().optional(),
      success: z.boolean(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const calculation = calculateCarFees(
        input.auction,
        input.auctionLocation!,
        input.originPort,
        input.bodyType,
        input.fuelType,
        input.purchaseFee,
        input.insurance
      );

      input.totalFee = calculation.totalFee;
      input.auctionFee = calculation.auctionFee;
      input.gateFee = calculation.gateFee;
      input.titleFee = calculation.titleFee;
      input.environmentalFee = calculation.environmentalFee;
      input.virtualBidFee = calculation.virtualBidFee;
      input.groundFee = calculation.groundFee;
      input.oceanFee = calculation.oceanFee;
      input.shippingFee = calculation.shippingFee;

      const result = await db.transaction(async (tx) => {
        const insertedCars = await tx
          .insert(cars)
          .values(input)
          .returning({ vin: cars.vin });

        const vin = insertedCars[0]?.vin;

        if (!vin) {
          throw new Error("Could not add a car");
        }

        return vin;
      });

      return {
        success: true,
        message: `Car with VIN code ${result} was added successfully`,
      };
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: errorMessage,
      };
    }
  });

export const getCarsAction = authedProcedure
  .createServerAction()
  .output(z.array(SelectSchema))
  .handler(async () => {
    try {
      const query = await db.query.cars.findMany({
        orderBy: desc(cars.purchaseDate),
        limit: 100,
      });

      console.log(query);

      return query || [];
    } catch (error) {
      console.error("Error fetching cars:", error);
      return [];
    }
  });

export const getCarAction = authedProcedure
  .createServerAction()
  .input(
    z.object({
      vin: z.string().optional(),
      id: z.number().optional(),
    })
  )
  .output(z.union([SelectSchema, z.null()]))
  .handler(async ({ input }) => {
    const { vin, id } = input;

    if (!id && !vin) {
      return null;
    }

    try {
      const whereClause = [];
      if (id !== undefined) {
        whereClause.push(eq(cars.id, id));
      }
      if (vin !== undefined) {
        whereClause.push(eq(cars.vin, vin));
      }

      const [carQuery] = await db
        .select()
        .from(cars)
        .where(or(...whereClause));

      return carQuery ?? null;
    } catch (error) {
      console.error("Error fetching car:", error);
      throw new Error("Failed to fetch car");
    }
  });

export const deleteCarAction = isAdminProcedure
  .createServerAction()
  .input(
    z.object({
      vin: z.string(),
    })
  )
  .output(
    z.object({
      message: z.string().optional(),
      success: z.boolean(),
    })
  )
  .handler(async ({ input }) => {
    const { vin } = input;

    try {
      const imageRecords = await db
        .select({ imageKey: images.imageKey })
        .from(images)
        .where(eq(images.carVin, vin));

      await Promise.all(
        imageRecords.map(async (record) => {
          if (record.imageKey) {
            await deleteObjectFromBucket(record.imageKey);
          }
        })
      );

      const deletedCar = await db
        .delete(cars)
        .where(eq(cars.vin, vin))
        .returning({ vin: cars.vin });

      if (!deletedCar.length) {
        return {
          success: false,
          message: "Car not found or could not be deleted",
        };
      }

      return {
        success: true,
        message: `Car with VIN ${vin} and its associated images were successfully deleted`,
      };
    } catch (error) {
      console.error("Error deleting car:", error);
      return {
        success: false,
        message: "An error occurred while deleting the car and its images",
      };
    }
  });

export const assignOwnerAction = isAdminProcedure
  .createServerAction()
  .input(
    z.object({
      vin: z.string(),
      carId: z.number(),
      ownerId: z.string().nullable(),
    })
  )
  .output(
    z.object({
      message: z.string().optional(),
      data: z.any().optional(),
      success: z.boolean(),
    })
  )
  .handler(async ({ input }) => {
    const { vin, carId, ownerId } = input;

    if (!carId || !vin) {
      return {
        success: false,
        message: "Provide car's vin code or id, and user's id",
      };
    }

    try {
      const whereClause = [];
      if (carId !== undefined) {
        whereClause.push(eq(cars.id, carId));
      }
      if (vin !== undefined) {
        whereClause.push(eq(cars.vin, vin));
      }

      const carExists = await db
        .select()
        .from(cars)
        .where(or(...whereClause))
        .limit(1);

      if (!carExists.length) {
        return {
          success: false,
          message: "Car does not exist",
        };
      }

      const [isAssigned] = await db
        .update(cars)
        .set({
          ownerId: ownerId,
        })
        .where(or(...whereClause))
        .returning({ vin: cars.vin });

      if (!isAssigned) {
        return {
          success: false,
          message: "Could not assign the owner to car",
        };
      }

      revalidatePath(`/admin/users/${ownerId}`);

      return {
        success: true,
        message:
          ownerId !== "none"
            ? `Car with vin code ${isAssigned.vin} was successfully assigned to the user with id ${ownerId}`
            : `Car's owner cleared`,
      };
    } catch (error) {
      console.error("Error assigning owner:", error);
      throw new Error("Failed to assign the owner to car");
    }
  });

export const assignRecieverAction = authedProcedure
  .createServerAction()
  .input(
    z.object({
      vin: z.string(),
      reciever: z.string().nullable(),
    })
  )
  .output(
    z.object({
      message: z.string().optional(),
      data: z.any().optional(),
      success: z.boolean(),
    })
  )
  .handler(async ({ input }) => {
    const { vin, reciever } = input;

    if (!vin) {
      return {
        success: false,
        message: "Provide car's vin code",
      };
    }

    try {
      const whereClause = [];
      if (vin !== undefined) {
        whereClause.push(eq(cars.vin, vin));
      }

      const carExists = await db
        .select()
        .from(cars)
        .where(or(...whereClause))
        .limit(1);

      if (!carExists.length) {
        return {
          success: false,
          message: "Car does not exist",
        };
      }

      const [isAssigned] = await db
        .update(cars)
        .set({
          reciever: reciever,
        })
        .where(or(...whereClause))
        .returning({ vin: cars.vin });

      if (!isAssigned) {
        return {
          success: false,
          message: "Could not assign the owner to car",
        };
      }

      revalidatePath(`/admin/cars`);

      return {
        success: true,
        message: `Car with vin code ${isAssigned.vin} was successfully assigned to the reciever ${reciever}`,
      };
    } catch (error) {
      console.error("Error assigning reciever:", error);
      throw new Error("Failed to assign the reciever to car");
    }
  });

export const updateCarAction = isAdminProcedure
  .createServerAction()
  .input(insertCarSchema)
  .output(
    z.object({
      message: z.string().optional(),
      data: z.any().optional(),
      success: z.boolean(),
    })
  )
  .handler(async ({ input }) => {
    input.ownerId = input.ownerId !== "none" ? input.ownerId : null;

    const calculation = calculateCarFees(
      input.auction,
      input.auctionLocation!,
      input.originPort,
      input.bodyType,
      input.fuelType,
      input.purchaseFee,
      input.insurance
    );

    input.totalFee = calculation.totalFee;
    input.auctionFee = calculation.auctionFee;
    input.gateFee = calculation.gateFee;
    input.titleFee = calculation.titleFee;
    input.environmentalFee = calculation.environmentalFee;
    input.virtualBidFee = calculation.virtualBidFee;
    input.groundFee = calculation.groundFee;
    input.oceanFee = calculation.oceanFee;
    input.shippingFee = calculation.shippingFee;

    try {
      const updatedCar = await db
        .update(cars)
        .set(input)
        .where(eq(cars.vin, input.vin))
        .returning();

      if (!updatedCar) {
        return {
          success: false,
          message: "Car update failed",
        };
      }

      return {
        success: true,
        message: `Car with VIN ${input.vin} was updated successfully`,
      };
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: errorMessage,
      };
    }
  });
