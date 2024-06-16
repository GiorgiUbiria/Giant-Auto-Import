"use server";

import { formSchema } from "@/components/editCar/formSchema";
import {
  carTable,
  parkingDetailsTable,
  priceTable,
  specificationsTable,
} from "../drizzle/schema";
import { db } from "../drizzle/db";
import { Car, CarData, ParkingDetails, Specifications } from "../interfaces";
import { getCarFromDatabaseByID } from "./dbActions";
import { eq } from "drizzle-orm";
import { FormValues } from "@/components/editCar/form";

export type EditCarPayload = { id: number; values: FormValues };

export async function editCarInDb(
  prevState: any,
  payload: EditCarPayload,
): Promise<{ error: string | null; success?: string }> {
  try {
    const { values, id } = payload;

    if (!id) {
      return { error: "Car ID is required for update." };
    }

    const result = formSchema.safeParse(values);
    if (!result.success) {
      return { error: result.error.message };
    }

    const carInstance: CarData = (await getCarFromDatabaseByID(id)) as CarData;
    if (!carInstance) {
      return { error: "Car not found." };
    }

    const pdId = carInstance.parking_details?.id;
    const spId = carInstance.specifications?.id;
    if (!pdId || !spId) {
      return { error: "Car details are incomplete." };
    }

    const carFields: (keyof Omit<
      Car,
      "id" | "createdAt" | "specificationsId" | "parkingDetailsId"
    >)[] = [
      "vin",
      "originPort",
      "destinationPort",
      "shipping",
      "auction",
      "departureDate",
      "arrivalDate",
    ];
    const specificationsFields: (keyof Omit<
      Specifications,
      "id" | "carfax" | "runndrive"
    >)[] = [
      "vin",
      "year",
      "make",
      "model",
      "trim",
      "manufacturer",
      "country",
      "engineType",
      "fuelType",
      "titleNumber",
      "titleState",
      "color",
      "bodyType",
    ];
    const parkingDetailFields: (keyof Omit<
      ParkingDetails,
      "id" | "parkingDateString"
    >)[] = ["fined", "arrived", "status"];

    for (const field of carFields) {
      if (
        values[field] !== undefined &&
        values[field] !== carInstance.car[field]
      ) {
        await db
          .update(carTable)
          .set({ [field]: values[field] })
          .where(eq(carTable.id, id));
      }
    }

    const specificationsInstance = carInstance.specifications;
    if (specificationsInstance) {
      for (const field of specificationsFields) {
        if (
          values[field] !== undefined &&
          values[field] !== specificationsInstance[field]
        ) {
          await db
            .update(specificationsTable)
            .set({ [field]: values[field] })
            .where(eq(specificationsTable.id, spId));
        }
      }
    }

    const parkingDetailsInstance = carInstance.parking_details;

    if (parkingDetailsInstance) {
      for (const field of parkingDetailFields) {
        if (
          values[field] !== undefined &&
          values[field] !== parkingDetailsInstance[field]
        ) {
          await db
            .update(parkingDetailsTable)
            .set({ [field]: values[field] })
            .where(eq(parkingDetailsTable.id, pdId));
        }
      }
    }

    const priceInstance = await db
      .select()
      .from(priceTable)
      .where(eq(priceTable.carId, id))
      .limit(1)
      .get();

    if (priceInstance) {
      if (
        values.price !== undefined &&
        values.price !== priceInstance.totalAmount
      ) {
        await db
          .update(priceTable)
          .set({ totalAmount: values.price })
          .where(eq(priceTable.carId, id));
      }
      if (
        values.priceCurrency !== undefined &&
        Number(values.priceCurrency) !== priceInstance.currencyId
      ) {
        await db
          .update(priceTable)
          .set({ currencyId: Number(values.priceCurrency) })
          .where(eq(priceTable.carId, id));
      }
    }

    return { error: null, success: "Car updated successfully" };
  } catch (error) {
    console.error(error)
    return { error: "Failed to update car in database" };
  }
}
