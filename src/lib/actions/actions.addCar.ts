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
import { formSchema2 } from "@/components/addCar/formSchema2";

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
  values: z.infer<typeof formSchema2>
): Promise<ActionResult | undefined> {
  // try {
  //
  // console.log(values)
  // const result = formSchema.safeParse(values);
  // if (!result.success) {
  //   return { error: result.error.message };
  // }
  //
  // console.log(result);
  //
  // return {
  //   error: "Something"
  // }
  
  // 
  // const result = formSchema2.safeParse(formData);
  // if (!result.success) {
  //   console.log(result.error.message);
  //   return { error: result.error.message };
  // }


  const result = formSchema2.safeParse(values);
  if (!result.success) {
    return { error: result.error.message };
  } else {
    return {
      error: null,
      success: "Car added successfully",
    }
  }

  //   const specifications: NewSpecification = {
  //     vin: vin,
  //     carfax: carfax,
  //     year: year,
  //     make: make,
  //     model: model,
  //     trim: trim,
  //     manufacturer: manufacturer,
  //     bodyType: bodyType,
  //     country: country,
  //     engineType: engineType,
  //     titleNumber: titleNumber,
  //     titleState: titleState,
  //     color: color,
  //     runndrive: fuelType,
  //   };
  //
  //   const parkingDetails: NewParkingDetails = {
  //     fined: fined,
  //     arrived: arrived,
  //     status: status,
  //     parkingDateString: parkingDateString,
  //   };
  //
  //   const specificationsId = await insertSpecification(specifications);
  //   const parkingDetailsId = await insertParkingDetails(parkingDetails);
  //
  //   const car: NewCar = {
  //     vin: vin,
  //     originPort: originPort,
  //     destinationPort: destinationPort,
  //     departureDate: departureDate,
  //     arrivalDate: arrivalDate,
  //     createdAt: createdAt,
  //     auction: auction,
  //     shipping: shipping,
  //     specificationsId: specificationsId[0].specificationsId,
  //     parkingDetailsId: parkingDetailsId[0].parkingDetailsId,
  //   };
  //
  //   const carId = await insertCar(car);
  //
  //   const newPrice: NewPrice = {
  //     totalAmount: price as number,
  //     currencyId: priceCurrency as number,
  //     carId: carId[0].carId,
  //   };
  //
  //   await insertPrice(newPrice);
  //
  //   console.log(`Car with VIN ${vin} added successfully.`);
  //
  //   return {
  //     error: null,
  //     success: "Car added successfully",
  //   };
  // } catch (error) {
  //   console.error(error);
  //   return {
  //     error: "Failed to add car to database",
  //   };
  // }
}
