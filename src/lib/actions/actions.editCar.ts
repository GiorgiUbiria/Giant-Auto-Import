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
import { CarData } from "../interfaces";
import { getCarFromDatabaseByID } from "./dbActions";
import { eq } from "drizzle-orm";
import { FormValues } from "@/components/editCar/form";

export type EditCarPayload = { id: number; values: FormValues };

export async function editCarInDb(
  prevState: any,
  payload: EditCarPayload,
): Promise<ActionResult | undefined> {
  try {
    const { values, id } = payload;
    console.log(values);
    console.log(id);

    if (!id) {
      return { error: "Car ID is required for update." };
    }

    const result = formSchema.safeParse(values);
    if (!result.success) {
      return { error: result.error.message };
    }

    const carInstance: CarData = (await getCarFromDatabaseByID(id)) as CarData;
    if (!carInstance) {
      return { error: "Car ID is required for update." };
    }

    const pdId = carInstance.parking_details?.id;
    const spId = carInstance.specifications?.id;
    if (!pdId || !spId) {
      return { error: "Car ID is required for update." };
    }

    const specificationsInstance = await db
      .select()
      .from(specificationsTable)
      .where(eq(specificationsTable.id, spId))
      .limit(1)
      .get();
    const parkingDetailsInstance = await db
      .select()
      .from(parkingDetailsTable)
      .where(eq(parkingDetailsTable.id, pdId))
      .limit(1)
      .get();
    const priceInstance = await db
      .select()
      .from(priceTable)
      .where(eq(priceTable.carId, id))
      .limit(1)
      .get();

    if (!specificationsInstance || !parkingDetailsInstance) {
      return { error: "Car ID is required for update." };
    }

    for (const [key, value] of Object.entries(carInstance)) {
      if (
        [
          "vin",
          "originPort",
          "destinationPort",
          "shipping",
          "auction",
          "departureDate",
          "arrivalDate",
        ].includes(key)
      ) {
        await db
          .update(carTable)
          .set({ [key]: value })
          .where(eq(carTable.id, id));
      }
    }

    for (const [key, value] of Object.entries(specificationsInstance)) {
      if (
        [
          "vin",
          "carfax",
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
        ].includes(key)
      ) {
        await db
          .update(specificationsTable)
          .set({ [key]: value })
          .where(eq(specificationsTable.id, spId));
      }
    }

    for (const [key, value] of Object.entries(parkingDetailsInstance)) {
      if (["fined", "arrived", "status", "parkingDateString"].includes(key)) {
        await db
          .update(parkingDetailsTable)
          .set({ [key]: value })
          .where(eq(parkingDetailsTable.id, pdId));
      }
    }

    if (priceInstance) {
      for (const [key, value] of Object.entries(priceInstance)) {
        if (["totalAmount", "currencyId"].includes(key)) {
          await db
            .update(priceTable)
            .set({ [key]: value })
            .where(eq(priceTable.carId, id));
        }
      }
    }

    return {
      error: null,
      success: "Car updated successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to update car in database",
    };
  }
}
