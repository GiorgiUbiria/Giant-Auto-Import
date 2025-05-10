"use server";

import { eq, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "../drizzle/db";
import { selectCarSchema, selectUserSchema, users } from "../drizzle/schema";
import { isAdminProcedure } from "./authProcedures";
import { revalidatePath } from "next/cache";

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

      return userQuery || [];
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  });

export const getUserAction = isAdminProcedure
  .createServerAction()
  .input(
    z.object({
      id: z.string(),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      user: SelectSchema.nullable(),
      cars: z.array(selectCarSchema).nullable(),
      message: z.string().optional(),
    })
  )
  .handler(async ({ input }) => {
    const { id } = input;

    if (!id) {
      return {
        success: false,
        user: null,
        cars: null,
        message: "No user ID provided",
      };
    }

    try {
      const [result] = await db.query.users.findMany({
        where: eq(users.id, id),
        with: {
          ownedCars: true,
        },
        limit: 1,
      });

      if (!result) {
        return {
          success: false,
          user: null,
          cars: null,
          message: "User not found",
        };
      }

      const { ownedCars, ...user } = result;
      
      // Revalidate the user's page
      revalidatePath(`/admin/users/${id}`);
      
      return {
        success: true,
        user,
        cars: ownedCars ?? [],
        message: "User fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      return {
        success: false,
        user: null,
        cars: null,
        message: "Failed to fetch user",
      };
    }
  });

export const deleteUserAction = isAdminProcedure
  .createServerAction()
  .input(
    z.object({
      id: z.string(),
    })
  )
  .output(
    z.object({
      message: z.string().optional(),
      data: z.any().optional(),
      success: z.boolean(),
    })
  )
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

      // Revalidate the users list
      revalidatePath('/admin/users');
      
      return {
        success: true,
        message: `User ${isDeleted.fullName} was deleted successfully`,
      };
    } catch (error) {
      console.error("Error deleting the user:", error);
      return {
        success: false,
        message: "Error deleting the user",
      };
    }
  });
