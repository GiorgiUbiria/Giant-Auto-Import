"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ActionResult } from "@/lib/utils";
import { z } from "zod";
import { db } from "../drizzle/db";
import {
  cars,
  insertCarSchema,
  selectCarSchema
} from "../drizzle/schema";

export async function getCars(): Promise<ActionResult> {
  try {
    const carData = await db
      .select()
      .from(cars);

    if (carData.length === 0) {
      return {
        error: "There are no cars",
        success: false,
      }
    }

    //TODO: Add Images

    return {
      success: true,
      message: "Cars retrieved successfully",
      data: carData,
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: "Failed to get cars",
    }
  }
}

export async function getCar(id: number | null, vin: string | null): Promise<ActionResult> {
  try {
    if (id === null && vin === null) {
      return {
        success: false,
        error: "Id or VIN code are required to delete a car",
      };
    }

    let carData: z.infer<typeof selectCarSchema>[];

    if (id !== null) {
      carData = await db
        .select()
        .from(cars)
        .where(eq(cars.id, id));
    } else if (vin !== null) {
      carData = await db
        .select()
        .from(cars)
        .where(eq(cars.vin, vin));
    } else {
      carData = []
    }

    if (carData.length === 0) {
      return {
        success: false,
        error: "Car not found"
      }
    }

    //TODO: Add Images

    return {
      success: true,
      message: "Car retrieved successfully",
      data: [carData],
    };
  } catch (error) {
    console.error("Error deleting car:", error);
    return {
      success: false,
      error: `Failed to delete a car from database: ${error}`,
    };
  }
}

export async function addCar(values: z.infer<typeof insertCarSchema>): Promise<ActionResult> {
  try {
    const result = insertCarSchema.safeParse(values);
    if (!result.success) {
      return { 
        success: false,
        error: result.error.message
      };
    }

    const car = result.data;

    const findCar = await db
      .select()
      .from(cars)
      .where(eq(cars.vin, car.vin));
    if (findCar.length > 0) {
      return {
        success: false,
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
        message: "Car added successfully",
        success: true,
      };
    }

    return {
      success: false,
      error: "Car was not added correctly",
    }
  } catch (error) {
    return {
      success: false,
      error: "Failed to add car to database",
    };
  }
}

//TODO: Edit car action

export async function deleteCar(id: number | null, vin: string | null): Promise<ActionResult> {
  try {
    if (id === null && vin === null) {
      return {
        success: false,
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
      message: "Car deleted successfully",
      success: true,
    };
  } catch (error) {
    console.error("Error deleting car:", error);
    return {
      success: false,
      error: `Failed to delete a car from database: ${error}`,
    };
  }
}
