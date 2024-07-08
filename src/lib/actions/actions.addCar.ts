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

const insertCar = async (car: NewCar) => {
  return db.insert(carTable).values(car).returning({ carId: carTable.id });
};

const insertSpecification = async (specification: NewSpecification) => {
  return db
    .insert(specificationsTable)
    .values(specification)
    .returning({ specificationsId: specificationsTable.id });
};

const insertParkingDetails = async (parkingDetails: NewParkingDetails) => {
  return db
    .insert(parkingDetailsTable)
    .values(parkingDetails)
    .returning({ parkingDetailsId: parkingDetailsTable.id });
};

const insertPrice = async (price: NewPrice) => {
  return db
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
      color,
      bodyType,
      destinationPort,
      originPort,
      auction,
      departureDate,
      arrivalDate,
      price,
    } = result.data;

    const findCar = await db.select().from(carTable).where(eq(carTable.vin, vin));
    if (findCar.length > 0) {
      return {
        error: "Car with this VIN already exists",
      };
    }

    const specifications: NewSpecification = {
      vin: vin,
      carfax: year + " " + make ? make : "" + " " + model ? model : "",
      year: year,
      make: make ? make : "",
      model: model ? model : "",
      bodyType: bodyType,
      fuelType: fuelType,
      color: color ? color : "",
    };

    const parkingDetails: NewParkingDetails = {
      trackingLink: trackingLink ? trackingLink : "",
      containerNumber: containerNumber ? containerNumber : "",
      bookingNumber: bookingNumber ? bookingNumber : "",
      status: status as CarStatus,
    };

    const specificationsId = await insertSpecification(specifications);
    const parkingDetailsId = await insertParkingDetails(parkingDetails);

    const car: NewCar = {
      vin: vin,
      originPort: originPort ? originPort : "",
      destinationPort: destinationPort ? destinationPort : "",
      departureDate:
        departureDate !== null && departureDate !== undefined
          ? new Date(departureDate)
          : null,
      arrivalDate:
        arrivalDate !== null && arrivalDate !== undefined
          ? new Date(arrivalDate)
          : null,
      createdAt: new Date(Date.now()),
      auction: auction ? auction : "",
      specificationsId: specificationsId[0].specificationsId,
      parkingDetailsId: parkingDetailsId[0].parkingDetailsId,
    };

    const carId = await insertCar(car);

    const newPrice: NewPrice = {
      totalAmount: price as number || 0,
      amountLeft: price as number || 0,
      carId: carId[0].carId,
    };

    await insertPrice(newPrice);

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
