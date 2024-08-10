"use server";

import { eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "../drizzle/db";
import { selectCarSchema, selectUserSchema, users } from "../drizzle/schema";
import { formatISO } from 'date-fns';
import { createServerActionProcedure } from "zsa";
import { getAuth } from "../auth";
import { z } from "zod";

const SelectSchema = selectUserSchema;

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
        .select()
        .from(users)
        .where(ne(users.role, "ADMIN"))
        .orderBy(users.role);

      return userQuery;
    } catch (error) {
      console.error(error);
      return [];
    }
  });

export const getUserAction = isAdminProcedure
  .createServerAction()
  .input(z.object({
    id: z.string(),
  }))
  .output(z.union([
    z.object({
      user: SelectSchema,
      cars: z.array(selectCarSchema.omit({ createdAt: true })),
    }),
    z.null()
  ]))
  .handler(async ({ input }) => {
    const { id } = input;

    if (!id) {
      console.log("No id");
      return null;
    }

    try {
      const [result] = await db
        .query.users.findMany({
          where: eq(users.id, id),
          with: {
            ownedCars: true,
          },
          limit: 1,
        });

      if (!result) return null;

      const { ownedCars, ...user } = result;
      return {
        user,
        cars: ownedCars ?? [],
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("Failed to fetch user");
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
      return {
        success: false,
        message: "Provide the user's id",
      };
    }

    try {
      const userExists = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!userExists.length) {
        return {
          success: false,
          message: "User does not exist",
        };
      }

      const [isDeleted] = await db
        .delete(users)
        .where(eq(users.id, id))
        .returning({ fullName: users.fullName });

      if (!isDeleted) {
        return {
          success: false,
          message: "Could not delete the user",
        };
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
