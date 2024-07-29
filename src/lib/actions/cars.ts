"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ActionResult } from "../form";
import { z } from "zod";
import { db } from "../drizzle/db";
import {
  cars,
  insertCarSchema
} from "../drizzle/schema";

export async function addCar(
  _prevState: any,
  values: z.infer<typeof insertCarSchema>,
): Promise<ActionResult | undefined> {
  try {
    const result = insertCarSchema.safeParse(values);
    if (!result.success) {
      return { error: result.error.message };
    }

    const car = result.data;

    const findCar = await db
      .select()
      .from(cars)
      .where(eq(cars.vin, car.vin));
    if (findCar.length > 0) {
      return {
        error: "Car with this VIN already exists",
      };
    }

    const query = await db
      .insert(cars)
      .values(car)
      .returning()

    if (query.length > 0) {
      revalidatePath("/admin/");

      return {
        error: null,
        success: "Car added successfully",
      };
    }
  } catch (error) {
    return {
      error: "Failed to add car to database",
    };
  }
}

export async function editCar(
  _prevState: any,
  values: z.infer<typeof insertCarSchema>,
): Promise<ActionResult | undefined> {
  try {
    const result = insertCarSchema.safeParse(values);
    if (!result.success) {
      return { error: result.error.message };
    }

    const car = result.data;

    const findCar = await db
      .select()
      .from(cars)
      .where(eq(cars.vin, car.vin));
    if (findCar.length > 0) {
      return {
        error: "Car with this VIN already exists",
      };
    }

    const query = await db
      .insert(cars)
      .values(car)
      .returning()

    if (query.length > 0) {
      revalidatePath("/admin/");

      return {
        error: null,
        success: "Car added successfully",
      };
    }
  } catch (error) {
    return {
      error: "Failed to add car to database",
    };
  }
}

export async function deleteCar(id: number | null, vin: string | null): Promise<ActionResult | undefined> {
  try {
    if (id === null && vin === null) {
      return {
        error: "Id or VIN code are required to delete a car",
      };
    }

    if (id !== null) {
      await db
        .delete(cars)
        .where(eq(cars.id, id));
    } else if (vin !== null) {
      await db
        .delete(cars)
        .where(eq(cars.vin, vin));
    }

    return {
      success: "Car deleted successfully",
      error: null,
    };
  } catch (error) {
    console.error("Error deleting car:", error);
    return {
      error: `Failed to delete a car from database: ${error}`,
    };
  }
}
