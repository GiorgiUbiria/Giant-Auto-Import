"use server";

import { eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "../drizzle/db";
import { selectCarSchema, selectUserSchema, users } from "../drizzle/schema";
import { isAdminProcedure } from "./authProcedures";

const SelectSchema = selectUserSchema;

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
      cars: z.array(selectCarSchema),
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

      return {
        success: true,
        message: `User ${isDeleted.fullName} was deleted successfully`,
      };
    } catch (error) {
      console.error("Error deleting the user:", error);
      throw new Error("Error deleting the user");
    }
  });
