"use server";

import { eq, ne } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../drizzle/db";
import { selectCarSchema, selectUserSchema, users } from "../drizzle/schema";
import { isAdminProcedure } from "./authProcedures";
import { revalidatePath } from "next/cache";

const SelectSchema = selectUserSchema;

export const getUsersAction = isAdminProcedure
  .createServerAction()
  .output(z.array(SelectSchema))
  .handler(async () => {
    try {
      console.log("getUsersAction: Fetching users");

      const db = getDb();

      // Validate database connection
      if (!db) {
        console.error("getUsersAction: Database connection not available");
        return [];
      }

      const userQuery = await db
        .select()
        .from(users)
        .where(ne(users.role, "ADMIN"))
        .orderBy(users.role);

      console.log("getUsersAction: Found", userQuery.length, "users");
      return userQuery || [];
    } catch (error) {
      console.error("getUsersAction: Error fetching users:", error);
      return [];
    }
  });

export const getUserAction = isAdminProcedure
  .createServerAction()
  .input(
    z.object({
      id: z.string().min(1, "User ID is required"),
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

    if (!id || typeof id !== "string") {
      console.log("getUserAction: Invalid user ID provided", { id });
      return {
        success: false,
        user: null,
        cars: null,
        message: "Invalid user ID provided",
      };
    }

    try {
      console.log("getUserAction: Fetching user", id);

      const db = getDb();

      // Validate database connection
      if (!db) {
        console.error("getUserAction: Database connection not available");
        return {
          success: false,
          user: null,
          cars: null,
          message: "Database connection error",
        };
      }

      const [result] = await db.query.users.findMany({
        where: eq(users.id, id),
        with: {
          ownedCars: true,
        },
        limit: 1,
      });

      if (!result) {
        console.log("getUserAction: User not found", id);
        return {
          success: false,
          user: null,
          cars: null,
          message: "User not found",
        };
      }

      // Safe destructuring with fallbacks
      const { ownedCars = [], ...user } = result;

      console.log("getUserAction: Successfully fetched user", id, "with", ownedCars.length, "cars");

      return {
        success: true,
        user,
        cars: ownedCars,
        message: "User fetched successfully",
      };
    } catch (error) {
      console.error("getUserAction: Error fetching user:", error);
      return {
        success: false,
        user: null,
        cars: null,
        message: "Error fetching user data",
      };
    }
  });

// New optimized action for admin user page with all data
export const getAdminUserPageDataAction = isAdminProcedure
  .createServerAction()
  .input(
    z.object({
      id: z.string().min(1, "User ID is required"),
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
    const startTime = Date.now();

    try {
      console.log("getAdminUserPageDataAction: Fetching complete user data", id);

      const db = getDb();

      if (!db) {
        console.error("getAdminUserPageDataAction: Database connection not available");
        return {
          success: false,
          user: null,
          cars: null,
          message: "Database connection error",
        };
      }

      // Single optimized query to get user with cars
      const [result] = await db.query.users.findMany({
        where: eq(users.id, id),
        with: {
          ownedCars: {
            orderBy: (cars, { desc }) => [desc(cars.purchaseDate)],
            limit: 100, // Limit to prevent memory issues
          },
        },
        limit: 1,
      });

      if (!result) {
        console.log("getAdminUserPageDataAction: User not found", id);
        return {
          success: false,
          user: null,
          cars: null,
          message: "User not found",
        };
      }

      const { ownedCars = [], ...user } = result;
      const duration = Date.now() - startTime;

      console.log(`getAdminUserPageDataAction: Successfully fetched user ${id} with ${ownedCars.length} cars in ${duration}ms`);

      return {
        success: true,
        user,
        cars: ownedCars,
        message: "User data fetched successfully",
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`getAdminUserPageDataAction: Error after ${duration}ms:`, error);
      return {
        success: false,
        user: null,
        cars: null,
        message: "Error fetching user data",
      };
    }
  });

export const deleteUserAction = isAdminProcedure
  .createServerAction()
  .input(
    z.object({
      id: z.string().min(1, "User ID is required"),
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

    if (!id || typeof id !== "string") {
      return {
        success: false,
        message: "Invalid user ID provided",
      };
    }

    try {
      // Validate database connection
      if (!getDb()) {
        console.error("deleteUserAction: Database connection not available");
        return {
          success: false,
          message: "Database connection error",
        };
      }

      const userExists = await getDb()
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

      const [isDeleted] = await getDb()
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
        message: `User ${isDeleted.fullName || 'Unknown'} was deleted successfully`,
      };
    } catch (error) {
      console.error("Error deleting the user:", error);
      return {
        success: false,
        message: "Error deleting the user",
      };
    }
  });
