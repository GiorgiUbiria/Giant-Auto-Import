"use server";

import { eq } from "drizzle-orm";
import {
  carTable,
  parkingDetailsTable,
  specificationsTable,
} from "../drizzle/schema";
import { db } from "../drizzle/db";
import { ActionResult } from "../form";
import { getCarFromDatabaseByVIN } from "./dbActions";
import { revalidatePath } from "next/cache";

export async function deleteCarFromDb(vin: string): Promise<ActionResult> {
  try {
    if (!vin) {
      return {
        error: "No car VIN provided",
      };
    }

    const carToFind = await getCarFromDatabaseByVIN(vin);
    if (!carToFind) {
      console.log(`Car with ID ${vin} not found.`);
      return { error: "Car not found" };
    }

    const carId: { deletedId: number }[] = await db
      .delete(carTable)
      .where(eq(carTable.vin, vin))
      .returning({ deletedId: carTable.id });

    let specsId: { deletedId: number }[] = [];
    if (carToFind.car.specificationsId !== null) {
      specsId = await db
        .delete(specificationsTable)
        .where(eq(specificationsTable.id, carToFind.car.specificationsId))
        .returning({ deletedId: specificationsTable.id });
    }
    let pdId: { deletedId: number }[] = [];
    if (carToFind.car.parkingDetailsId !== null) {
      pdId = await db
        .delete(parkingDetailsTable)
        .where(eq(parkingDetailsTable.id, carToFind.car.parkingDetailsId))
        .returning({ deletedId: parkingDetailsTable.id });
    }

    if (
      !carId[0].deletedId ||
      !specsId[0].deletedId ||
      !pdId[0].deletedId
    ) {
      return { error: "Car ID is required for delete." };
    }

    revalidatePath("/admin/");

    return {
      error: null,
      success: `Car with ID ${carId[0].deletedId} deleted successfully.`,
    };
  } catch (error) {
    console.error("Error details:", error);
    return { error: "Failed to delete car from database" };
  }
}
