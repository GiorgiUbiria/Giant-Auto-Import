"use server";

import { ActionResult } from "next/dist/server/app-render/types";
import { z } from "zod";
import { formSchema } from "@/components/addCar/formSchema";
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
      country,
      status,
      engineType,
      fuelType,
      titleNumber,
      titleState,
      color,
      bodyType,
      destinationPort,
      originPort,
      auction,
      shipping,
      departureDate,
      arrivalDate,
      fined,
      arrived,
      price,
    } = result.data;

    const specifications: NewSpecification = {
      vin: vin,
      carfax: year + " " + make + " " + model + " " + country,
      year: year,
      make: make,
      model: model,
      bodyType: bodyType,
      country: country,
      engineType: engineType,
      titleNumber: titleNumber,
      titleState: titleState,
      color: color,
      runndrive: fuelType,
    };

    const parkingDetails: NewParkingDetails = {
      fined: fined,
      arrived: arrived,
      status: status as CarStatus,
    };

    const specificationsId = await insertSpecification(specifications);
    const parkingDetailsId = await insertParkingDetails(parkingDetails);

    const car: NewCar = {
      vin: vin,
      originPort: originPort,
      destinationPort: destinationPort,
      departureDate:
        departureDate !== null && departureDate !== undefined
          ? new Date(departureDate)
          : null,
      arrivalDate:
        arrivalDate !== null && arrivalDate !== undefined
          ? new Date(arrivalDate)
          : null,
      createdAt: new Date(),
      auction: auction,
      shipping: shipping,
      specificationsId: specificationsId[0].specificationsId,
      parkingDetailsId: parkingDetailsId[0].parkingDetailsId,
    };

    const carId = await insertCar(car);

    const newPrice: NewPrice = {
      totalAmount: price as number,
      amountLeft: price as number,
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
