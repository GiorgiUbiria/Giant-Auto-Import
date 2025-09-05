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
  calculateCarFeesWithUserPricing,
} from "../calculator-utils";
import { authedProcedure, isAdminProcedure } from "./authProcedures";
import { createServerAction } from "zsa";
import { deleteObjectFromBucket, cleanUpBucketForVin } from "./bucketActions";
import { getAuth } from "@/lib/auth";

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

async function calculateCarFees(
  auction: string,
  auctionLocation: string,
  port: string,
  body: string,
  fuel: string,
  purchaseFee: number,
  insurance: "YES" | "NO",
  ownerId?: string
) {
  return await calculateCarFeesWithUserPricing(
    auction,
    auctionLocation,
    port,
    body,
    fuel,
    purchaseFee,
    insurance,
    ownerId
  );
}

export const addCarAction = createServerAction()
  .input(AddCarSchema)
  .output(
    z.object({
      message: z.string().optional(),
      data: z.any().optional(),
      success: z.boolean(),
    })
  )
  .handler(async ({ input }) => {
    try {
      console.log("addCarAction: Starting car addition", {
        vin: input.vin,
        auction: input.auction,
      });

      // Manual authentication check
      const { user } = await getAuth();

      if (!user) {
        console.error("addCarAction: No authenticated user");
        return {
          success: false,
          message: "Authentication required",
        };
      }

      if ((user as any).role !== "ADMIN") {
        console.error("addCarAction: User is not admin", {
          role: (user as any).role,
        });
        return {
          success: false,
          message: "Admin access required",
        };
      }

      // Validate required fields
      if (!input.vin || !input.auction || !input.originPort) {
        console.log("addCarAction: Missing required fields", {
          vin: input.vin,
          auction: input.auction,
          originPort: input.originPort,
        });
        return {
          success: false,
          message: "Missing required fields: VIN, auction, or origin port",
        };
      }

      // Handle empty ownerId - convert to null for database
      if (input.ownerId === "" || input.ownerId === "none") {
        input.ownerId = null;
      }

      console.log("addCarAction: Calculating fees...");
      const calculation = await calculateCarFees(
        input.auction,
        input.auctionLocation!,
        input.originPort,
        input.bodyType,
        input.fuelType,
        input.purchaseFee,
        input.insurance,
        input.ownerId || undefined
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

      console.log("addCarAction: Inserting car into database...");
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

      console.log("addCarAction: Car added successfully", { vin: result });
      return {
        success: true,
        message: `Car with VIN code ${result} was added successfully`,
      };
    } catch (error) {
      console.error("addCarAction error:", error);

      // Enhanced error handling for different constraint violations
      let errorMessage = "An error occurred while adding the car";

      if (error instanceof Error) {
        const errorStr = error.message;

        if (errorStr.includes("SQLITE_CONSTRAINT")) {
          if (errorStr.includes("FOREIGN KEY constraint failed")) {
            if (errorStr.includes("owner_id")) {
              errorMessage =
                "Invalid owner ID provided. Please select a valid user or leave owner field empty.";
            } else {
              errorMessage =
                "Database constraint violation. Please check all required fields and relationships.";
            }
          } else if (errorStr.includes("UNIQUE constraint failed")) {
            if (errorStr.includes("vin")) {
              errorMessage =
                "A car with this VIN already exists in the database.";
            } else {
              errorMessage =
                "Duplicate entry detected. Please check for duplicate values.";
            }
          } else if (errorStr.includes("NOT NULL constraint failed")) {
            errorMessage =
              "Required field is missing. Please fill in all required fields.";
          } else {
            errorMessage = "Database constraint violation: " + errorStr;
          }
        } else {
          errorMessage = errorStr;
        }
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  });

export const getCarsAction = createServerAction()
  .output(z.array(SelectSchema))
  .handler(async () => {
    try {
      // Manual authentication check
      const { user } = await getAuth();

      if (!user) {
        console.error("getCarsAction: No authenticated user");
        return [];
      }

      if ((user as any).role !== "ADMIN") {
        console.error("getCarsAction: User is not admin", {
          role: (user as any).role,
        });
        return [];
      }

      const query = await db.query.cars.findMany({
        orderBy: desc(cars.purchaseDate),
        limit: 50,
      });

      return query || [];
    } catch (error) {
      console.error("Error fetching cars:", error);
      return [];
    }
  });

export const getCarsForUserAction = authedProcedure
  .createServerAction()
  .input(
    z.object({
      id: z.string(),
    })
  )
  .output(z.array(SelectSchema))
  .handler(async ({ input }) => {
    try {
      const query = await db.query.cars.findMany({
        where: eq(cars.ownerId, input.id),
        orderBy: desc(cars.purchaseDate),
        limit: 100,
      });

      return query || [];
    } catch (error) {
      console.error("Error fetching cars:", error);
      return [];
    }
  });

// Public version for car details page (no auth required)
export const getCarPublicAction = createServerAction()
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
      console.error("getCarPublicAction: Neither id nor vin provided");
      return null;
    }

    try {
      // Log the input for debugging
      console.log("getCarPublicAction: Input received", { vin, id });

      const whereClause = [];
      if (id !== undefined) {
        whereClause.push(eq(cars.id, id));
      }
      if (vin !== undefined) {
        whereClause.push(eq(cars.vin, vin));
      }

      console.log("getCarPublicAction: Executing database query");
      const [carQuery] = await db
        .select()
        .from(cars)
        .where(or(...whereClause));

      console.log("getCarPublicAction: Query completed", {
        found: !!carQuery,
        vin: carQuery?.vin,
      });
      return carQuery ?? null;
    } catch (error) {
      console.error("getCarPublicAction: Database error", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        vin,
        id,
      });

      // Instead of throwing, return null to prevent 500 errors
      return null;
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
  .handler(async ({ input, ctx }) => {
    const { vin, id } = input;

    if (!id && !vin) {
      console.error("getCarAction: Neither id nor vin provided");
      return null;
    }

    try {
      // Log the input for debugging
      console.log("getCarAction: Input received", {
        vin,
        id,
        userId: ctx.user?.id,
      });

      const whereClause = [];
      if (id !== undefined) {
        whereClause.push(eq(cars.id, id));
      }
      if (vin !== undefined) {
        whereClause.push(eq(cars.vin, vin));
      }

      console.log("getCarAction: Executing database query");
      const [carQuery] = await db
        .select()
        .from(cars)
        .where(or(...whereClause));

      console.log("getCarAction: Query completed", {
        found: !!carQuery,
        vin: carQuery?.vin,
      });
      return carQuery ?? null;
    } catch (error) {
      console.error("getCarAction: Database error", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        vin,
        id,
        userId: ctx.user?.id,
      });

      // Instead of throwing, return null to prevent 500 errors
      return null;
    }
  });

export const deleteCarAction = createServerAction()
  .input(
    z.object({
      vin: z.string(),
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
    const { vin } = input;

    try {
      console.log("deleteCarAction: Starting deletion process", { vin });

      // Manual authentication check
      const { user } = await getAuth();

      if (!user) {
        console.error("deleteCarAction: No authenticated user");
        return {
          success: false,
          message: "Authentication required",
        };
      }

      if (user.role !== "ADMIN") {
        console.error("deleteCarAction: User is not admin", {
          role: user.role,
        });
        return {
          success: false,
          message: "Admin access required",
        };
      }

      if (!vin) {
        console.error("deleteCarAction: No VIN provided");
        return {
          success: false,
          message: "Provide the car's vin code",
        };
      }

      console.log("deleteCarAction: Checking if car exists", { vin });
      const carExists = await db
        .select()
        .from(cars)
        .where(eq(cars.vin, vin))
        .limit(1);

      if (!carExists.length) {
        console.error("deleteCarAction: Car not found", { vin });
        return {
          success: false,
          message: "Car does not exist",
        };
      }

      console.log("deleteCarAction: Car found, starting cleanup", { vin });

      // Delete all images for this car first
      console.log("deleteCarAction: Cleaning up bucket for VIN", { vin });
      await cleanUpBucketForVin(vin);
      console.log("deleteCarAction: Bucket cleanup completed", { vin });

      console.log("deleteCarAction: Deleting car from database", { vin });
      const [isDeleted] = await db
        .delete(cars)
        .where(eq(cars.vin, vin))
        .returning({ vin: cars.vin });

      if (!isDeleted) {
        console.error("deleteCarAction: Failed to delete car from database", {
          vin,
        });
        return {
          success: false,
          message: "Could not delete the car",
        };
      }

      console.log(
        "deleteCarAction: Car deleted successfully, revalidating paths",
        { vin }
      );
      revalidatePath("/admin/cars");
      revalidatePath("/dashboard");

      console.log("deleteCarAction: Deletion process completed successfully", {
        vin,
      });
      return {
        success: true,
        message: `Car with vin code ${isDeleted.vin} was deleted successfully`,
      };
    } catch (error) {
      console.error("deleteCarAction: Error during deletion process", {
        vin,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
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
      // Log current image priorities before ownership change for debugging
      const currentImages = await db
        .select({ imageKey: images.imageKey, priority: images.priority })
        .from(images)
        .where(eq(images.carVin, vin));

      console.log("Image priorities before ownership change:", {
        vin,
        currentImages,
      });

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

      // Log image priorities after ownership change to detect any changes
      const updatedImages = await db
        .select({ imageKey: images.imageKey, priority: images.priority })
        .from(images)
        .where(eq(images.carVin, vin));

      console.log("Image priorities after ownership change:", {
        vin,
        updatedImages,
      });

      // Check if any image priorities changed unexpectedly
      const priorityChanged = currentImages.some(
        (img, index) => img.priority !== updatedImages[index]?.priority
      );

      if (priorityChanged) {
        console.warn(
          "WARNING: Image priorities changed during ownership assignment!",
          {
            vin,
            before: currentImages,
            after: updatedImages,
          }
        );
      }

      // Comprehensive revalidation to ensure all views update
      // Note: The main cars table uses React Query with keys like ["getCars", pageIndex, pageSize, sorting, filters]
      // The revalidatePath calls will trigger server-side revalidation, but React Query cache invalidation
      // should also be handled in the components that call this action
      revalidatePath(`/admin/users/profile/${ownerId}`);
      revalidatePath(`/admin/cars`);
      revalidatePath(`/dashboard`);
      revalidatePath(`/car/${vin}`);

      return {
        success: true,
        message:
          ownerId !== "none"
            ? `Car with vin code ${isAssigned.vin} was successfully assigned to the user with id ${ownerId}`
            : `Car's owner cleared`,
      };
    } catch (error) {
      console.error("Error assigning owner:", error);

      // Enhanced error handling for different constraint violations
      let errorMessage = "Failed to assign the owner to car";

      if (error instanceof Error) {
        const errorStr = error.message;

        if (errorStr.includes("SQLITE_CONSTRAINT")) {
          if (errorStr.includes("FOREIGN KEY constraint failed")) {
            if (errorStr.includes("owner_id")) {
              errorMessage =
                "Invalid owner ID provided. The specified user does not exist in the database.";
            } else {
              errorMessage =
                "Database constraint violation. Please check all required fields and relationships.";
            }
          } else if (errorStr.includes("NOT NULL constraint failed")) {
            errorMessage =
              "Required field is missing. Please fill in all required fields.";
          } else {
            errorMessage = "Database constraint violation: " + errorStr;
          }
        } else {
          errorMessage = errorStr;
        }
      }

      return {
        success: false,
        message: errorMessage,
      };
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
      revalidatePath(`/dashboard`);
      revalidatePath(`/car/${vin}`);

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
    // Handle empty ownerId - convert to null for database
    if (input.ownerId === "" || input.ownerId === "none") {
      input.ownerId = null;
    }

    const calculation = await calculateCarFees(
      input.auction,
      input.auctionLocation!,
      input.originPort,
      input.bodyType,
      input.fuelType,
      input.purchaseFee,
      input.insurance,
      input.ownerId || undefined
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

      // Add comprehensive revalidation to ensure all views update
      revalidatePath(`/admin/cars`);
      revalidatePath(`/dashboard`);
      revalidatePath(`/car/${input.vin}`);
      if (input.ownerId) {
        revalidatePath(`/admin/users/profile/${input.ownerId}`);
      }

      return {
        success: true,
        message: `Car with VIN ${input.vin} was updated successfully`,
      };
    } catch (error) {
      console.error("updateCarAction error:", error);

      // Enhanced error handling for different constraint violations
      let errorMessage = "An error occurred while updating the car";

      if (error instanceof Error) {
        const errorStr = error.message;

        if (errorStr.includes("SQLITE_CONSTRAINT")) {
          if (errorStr.includes("FOREIGN KEY constraint failed")) {
            if (errorStr.includes("owner_id")) {
              errorMessage =
                "Invalid owner ID provided. Please select a valid user or leave owner field empty.";
            } else {
              errorMessage =
                "Database constraint violation. Please check all required fields and relationships.";
            }
          } else if (errorStr.includes("UNIQUE constraint failed")) {
            if (errorStr.includes("vin")) {
              errorMessage =
                "A car with this VIN already exists in the database.";
            } else {
              errorMessage =
                "Duplicate entry detected. Please check for duplicate values.";
            }
          } else if (errorStr.includes("NOT NULL constraint failed")) {
            errorMessage =
              "Required field is missing. Please fill in all required fields.";
          } else {
            errorMessage = "Database constraint violation: " + errorStr;
          }
        } else {
          errorMessage = errorStr;
        }
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  });
