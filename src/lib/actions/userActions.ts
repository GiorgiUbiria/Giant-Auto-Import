"use server";

import { eq } from "drizzle-orm";
import { db } from "../drizzle/db";
import { carTable, userCarTable, userTable } from "../drizzle/schema";
import { ActionResult } from "../form";
import { UserWithCarsAndSpecs } from "../interfaces";
import { getUser } from "./dbActions";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function removeUser(
  id: string,
): Promise<ActionResult | undefined> {
  try {
    if (!id) {
      return {
        error: "No user ID provided",
      };
    }

    const userToFind: UserWithCarsAndSpecs | undefined = await getUser(id);

    if (!userToFind) {
      console.log(`User with ID ${id} not found.`);
      return { error: "User not found" };
    }

    const result = await db
      .delete(userTable)
      .where(eq(userTable.id, id))
      .returning({ deletedId: userTable.id });

    if (result.length === 0 || !result[0].deletedId) {
      console.log(`User with ID ${id} not found or deletion failed.`);
      return { error: "Deletion failed" };
    }

    console.log(`User with ID ${result[0].deletedId} removed successfully.`);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to remove user in database");
  } finally {
    revalidatePath("/admin/users/");
    return redirect("/admin/users/");
  }
}

export async function getUserByCarId(carId: number): Promise<ActionResult> {
  try {
    const userCar = await db
      .select({ userId: userCarTable.userId })
      .from(userCarTable)
      .where(eq(userCarTable.carId, carId))
      .limit(1)
      .offset(0);

    if (userCar.length === 0) {
      return { error: "User not found" };
    }

    const { userId } = userCar[0];

    const user = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, userId!))
      .orderBy()
      .limit(1);

    if (user.length === 0) {
      return { error: "User not found" };
    }

    return { success: "User found", data: user[0], error: null };
  } catch (error) {
    console.error(error);
    return { error: "Failed to get user" };
  }
}
