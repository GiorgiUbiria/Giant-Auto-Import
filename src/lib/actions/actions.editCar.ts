import { ActionResult } from "next/dist/server/app-render/types";
import { z } from "zod";
import { formSchema } from "@/components/addCar/formSchema";
import {
  carTable,
  parkingDetailsTable,
  specificationsTable,
} from "../drizzle/schema";
import { db } from "../drizzle/db";
import { CarData } from "../interfaces";
import { getCarFromDatabaseByID } from "./dbActions";
import { eq } from "drizzle-orm";
import { FormValues } from "@/components/editCar/form";

export type EditCarPayload = { id: number, values: FormValues };

export async function editCarInDb(
  prevState: any,
  payload: EditCarPayload,
): Promise<ActionResult | undefined> {
  try {
    const { values, id  } = payload;
    console.log(values)
    console.log(id)

    if (!id) {
      return { error: "Car ID is required for update." };
    }

    const carInstance: CarData = (await getCarFromDatabaseByID(id)) as CarData;
    if (!carInstance) {
      return { error: "Car ID is required for update." };
    }

    const pdId = carInstance.parking_details?.id;
    const spId = carInstance.specifications?.id;
    if (!pdId || !spId) {
      throw new Error("Car ID is required for update.");
    }

    // const specificationsInstance = await db
    //   .select()
    //   .from(specificationsTable)
    //   .where(eq(specificationsTable.id, spId))
    //   .limit(1)
    //   .get();
    // const parkingDetailsInstance = await db
    //   .select()
    //   .from(parkingDetailsTable)
    //   .where(eq(parkingDetailsTable.id, pdId))
    //   .limit(1)
    //   .get();
    //
    // if (!specificationsInstance || !parkingDetailsInstance) {
    //   throw new Error("Car ID is required for update.");
    // }
    //
    // for (const [key, value] of Object.entries(carData)) {
    //   if (["vin", "originPort", "destinationPort", "shipping"].includes(key)) {
    //     await db
    //       .update(carTable)
    //       .set({ [key]: value })
    //       .where(eq(carTable.id, id));
    //   }
    // }
    //
    // for (const [key, value] of Object.entries(carData)) {
    //   if (
    //     [
    //       "vin",
    //       "carfax",
    //       "year",
    //       "make",
    //       "model",
    //       "trim",
    //       "manufacturer",
    //       "country",
    //       "engineType",
    //       "fuelType",
    //       "titleNumber",
    //     ].includes(key)
    //   ) {
    //     await db
    //       .update(specificationsTable)
    //       .set({ [key]: value })
    //       .where(eq(specificationsTable.id, spId));
    //   }
    // }
    //
    // for (const [key, value] of Object.entries(carData)) {
    //   if (["fined", "arrived", "status", "parkingDateString"].includes(key)) {
    //     await db
    //       .update(parkingDetailsTable)
    //       .set({ [key]: value })
    //       .where(eq(parkingDetailsTable.id, pdId));
    //   }
    // }
    //
    // console.log(`Car with ID ${id} updated successfully.`);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update car in database");
  }
}
