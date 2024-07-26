"use server";

import { ActionResult } from "next/dist/server/app-render/types";
import { z } from "zod";
import { formSchema } from "@/components/addCar/formSchema";
import { eq } from "drizzle-orm";
import {
  carTable,
  parkingDetailsTable,
  priceTable,
  specificationsTable,
} from "../drizzle/schema";
import { db } from "../drizzle/db";
import { CarStatus } from "../interfaces";
import { revalidatePath } from "next/cache";

type NewCar = typeof carTable.$inferInsert;
type NewSpecification = typeof specificationsTable.$inferInsert;
type NewParkingDetails = typeof parkingDetailsTable.$inferInsert;
type NewPrice = typeof priceTable.$inferInsert;

const insertCar = async (trx: any, car: NewCar) => {
  return trx.insert(carTable).values(car).returning({ carId: carTable.id });
};

const insertSpecification = async (trx: any,specification: NewSpecification) => {
  return trx 
    .insert(specificationsTable)
    .values(specification)
    .returning({ specificationsId: specificationsTable.id });
};

const insertParkingDetails = async (trx: any, parkingDetails: NewParkingDetails) => {
  return trx 
    .insert(parkingDetailsTable)
    .values(parkingDetails)
    .returning({ parkingDetailsId: parkingDetailsTable.id });
};

const insertPrice = async (trx: any, price: NewPrice) => {
  return trx 
    .insert(priceTable)
    .values(price)
    .returning({ priceId: priceTable.id });
};

export async function addCarToDb(
  prevState: any,
  values: z.infer<typeof formSchema>,
): Promise<ActionResult | undefined> {
  try {
    const result = formSchema.safeParse(values);
    if (!result.success) {
      return { error: result.error.message };
    }

    const {
      vin,
      year,
      make,
      model,
      containerNumber,
      bookingNumber,
      trackingLink,
      status,
      fuelType,
      auctionFee,
      lotNumber,
      color,
      bodyType,
      shippingFee,
      originPort,
      auction,
      departureDate,
      arrivalDate,
    } = result.data;

    const findCar = await db
      .select()
      .from(carTable)
      .where(eq(carTable.vin, vin));
    if (findCar.length > 0) {
      return {
        error: "Car with this VIN already exists",
      };
    }

    await db.transaction(async (trx) => {
      const specifications: NewSpecification = {
        vin: vin,
        carfax: `${year} ${make || ""} ${model || ""}`,
        year: year,
        make: make || "",
        model: model || "",
        bodyType: bodyType,
        fuelType: fuelType,
        color: color || "",
      };

      const parkingDetails: NewParkingDetails = {
        trackingLink: trackingLink || "",
        containerNumber: containerNumber || "",
        bookingNumber: bookingNumber || "",
        lotNumber: lotNumber || "", 
        status: status as CarStatus,
      };

      const specificationsId = await insertSpecification(trx,specifications);
      const parkingDetailsId = await insertParkingDetails(trx, parkingDetails);

      const car: NewCar = {
        vin: vin,
        originPort: originPort || "",
        destinationPort: "Poti",
        departureDate: departureDate ? new Date(departureDate) : null,
        arrivalDate: arrivalDate ? new Date(arrivalDate) : null,
        createdAt: new Date(Date.now()),
        auction: auction || "",
        specificationsId: specificationsId[0].specificationsId,
        parkingDetailsId: parkingDetailsId[0].parkingDetailsId,
      };

      const carId = await insertCar(trx, car);

      const newPrice: NewPrice = {
        totalAmount: (shippingFee && auctionFee) ? shippingFee + auctionFee : 0,
        amountLeft: (shippingFee && auctionFee) ? shippingFee + auctionFee : 0,
        auctionFee: auctionFee || 0,
        totalDue: (shippingFee && auctionFee) ? shippingFee + auctionFee : 0,
        carId: carId[0].carId,
      };

      await insertPrice(trx, newPrice);
    });

    revalidatePath("/admin/");

    return {
      error: null,
      success: "Car added successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to add car to database",
    };
  }
}
