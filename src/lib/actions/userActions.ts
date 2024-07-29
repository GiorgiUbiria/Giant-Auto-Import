"use server";

import { ActionResult } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "../drizzle/db";
import { users } from "../drizzle/schema";

export async function removeUser(id: string): Promise<ActionResult> {
  try {
    if (!id) {
      return {
        success: false,
        error: "No user ID provided",
      };
    }

    const userToFind = await db.select().from(users).where(eq(users.id, id));

    if (userToFind.length === 0) {
      return {
        success: false,
        error: `User with id-{${id}} not found`,
      };
    }

    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!deleted.id) {
      return {
        success: false,
        error: "Deletion failed",
      };
    }

    return {
      success: true,
      message: `User with id-{${id}} deleted successfully`,
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    revalidatePath("/admin/users/");
    redirect("/admin/users/");
  }
}
