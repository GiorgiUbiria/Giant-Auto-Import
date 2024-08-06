"use server";

import { ActionResult } from "@/lib/utils";
import { eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "../drizzle/db";
import { selectUserSchema, users } from "../drizzle/schema";
import { createServerAction, createServerActionProcedure } from "zsa";
import { getAuth } from "../auth";
import { z } from "zod";

const SelectSchema = selectUserSchema.omit({ password: true, passwordText: true, priceList: true, })

const authedProcedure = createServerActionProcedure()
  .handler(async () => {
    try {
      const { user, session } = await getAuth();

      return {
        user,
        session,
      };
    } catch {
      throw new Error("User not authenticated")
    }
  });

const isAdminProcedure = createServerActionProcedure(authedProcedure)
  .handler(async ({ ctx }) => {
    const { user, session } = ctx;

    if (user?.role !== "ADMIN") {
      throw new Error("User is not an admin")
    }

    return {
      user,
      session,
    }
  });

export const getUsersAction = isAdminProcedure
  .createServerAction()
  .output(z.array(SelectSchema))
  .handler(async () => {
    try {
      const userQuery = await db
        .select({
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          phone: users.phone,
          balance: users.balance,
          deposit: users.deposit,
          role: users.role
        })
        .from(users)
        .where(ne(users.role, "ADMIN"))
        .orderBy(users.role);

      return userQuery;
    } catch (error) {
      console.error(error);
      return [];
    }
  });

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
