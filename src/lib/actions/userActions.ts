"use server";

import { ActionResult } from "@/lib/utils";
import { eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "../drizzle/db";
import { selectUserSchema, users } from "../drizzle/schema";
import { createServerActionProcedure } from "zsa";
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

export const deleteUserAction = isAdminProcedure
	.createServerAction()
	.input(z.object({
		id: z.string(),
	}))
	.output(z.object({
		message: z.string().optional(),
		data: z.any().optional(),
		success: z.boolean(),
	}))
	.handler(async ({ input }) => {
		const { id } = input;

		if (!id) {
			return ({
				success: false,
				message: "Provide the user's id",
			})
		}

		try {
			const [isDeleted] = await db
				.delete(users)
				.where(eq(users.id, id))
				.returning({ fullName: users.fullName });

			if (!isDeleted) {
				return ({
					success: false,
					message: "Could not delete the user",
				})
			}

			revalidatePath("/admin/users");

			return {
				success: true,
				message: `User ${isDeleted.fullName} was deleted successfully`,
			};
		} catch (error) {
			console.error("Error deleting the user:", error);
			throw new Error("Error deleting the user");
		}
	});

