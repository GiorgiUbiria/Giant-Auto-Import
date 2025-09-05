"use server";

import { eq, ne } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../drizzle/db";
import { selectCarSchema, selectUserSchema, users } from "../drizzle/schema";
import { isAdminProcedure } from "./authProcedures";
import { revalidatePath } from "next/cache";
import logger from "@/lib/logger";

const SelectSchema = selectUserSchema;

export const getUsersAction = isAdminProcedure
  .createServerAction()
  .output(z.array(SelectSchema))
  .handler(async () => {
    try {
      logger.debug("[userActions.getUsers] start");

      const db = getDb();

      // Validate database connection
      if (!db) {
        logger.error("[userActions.getUsers] no db connection");
        return [];
      }

      const userQuery = await db
        .select()
        .from(users)
        .where(ne(users.role, "ADMIN"))
        .orderBy(users.role);

      logger.info("[userActions.getUsers] success", {
        count: userQuery.length,
      });
      return userQuery || [];
    } catch (error) {
      logger.error("[userActions.getUsers] error", { error });
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
      logger.warn("[userActions.getUser] invalid id", { id });
      return {
        success: false,
        user: null,
        cars: null,
        message: "Invalid user ID provided",
      };
    }

    try {
      logger.debug("[userActions.getUser] start", { id });

      const db = getDb();

      // Validate database connection
      if (!db) {
        logger.error("[userActions.getUser] no db connection");
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
        logger.warn("[userActions.getUser] not found", { id });
        return {
          success: false,
          user: null,
          cars: null,
          message: "User not found",
        };
      }

      // Safe destructuring with fallbacks
      const { ownedCars = [], ...user } = result;

      logger.info("[userActions.getUser] success", {
        id,
        cars: ownedCars.length,
      });

      return {
        success: true,
        user,
        cars: ownedCars,
        message: "User fetched successfully",
      };
    } catch (error) {
      logger.error("[userActions.getUser] error", { id, error });
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
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug("[userActions.getAdminUserPageData] attempt", {
          id,
          attempt,
          maxRetries,
        });

        const db = getDb();

        if (!db) {
          logger.error("[userActions.getAdminUserPageData] no db", {
            id,
            attempt,
          });
          if (attempt === maxRetries) {
            return {
              success: false,
              user: null,
              cars: null,
              message: "Database connection error",
            };
          }
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 100 * attempt));
          continue;
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
          logger.warn("[userActions.getAdminUserPageData] not found", {
            id,
            attempt,
          });
          return {
            success: false,
            user: null,
            cars: null,
            message: "User not found",
          };
        }

        const { ownedCars = [], ...user } = result;
        const duration = Date.now() - startTime;

        logger.info("[userActions.getAdminUserPageData] success", {
          id,
          cars: ownedCars.length,
          duration,
          attempt,
        });

        return {
          success: true,
          user,
          cars: ownedCars,
          message: "User data fetched successfully",
        };
      } catch (error) {
        lastError = error as Error;
        const duration = Date.now() - startTime;
        logger.error("[userActions.getAdminUserPageData] attempt failed", {
          id,
          attempt,
          duration,
          error,
        });

        if (attempt < maxRetries) {
          // Wait before retry with exponential backoff
          const waitTime = 100 * Math.pow(2, attempt - 1);
          logger.debug("[userActions.getAdminUserPageData] backoff", {
            id,
            waitTime,
            nextAttempt: attempt + 1,
          });
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }

    // All retries failed
    const duration = Date.now() - startTime;
    logger.error("[userActions.getAdminUserPageData] all attempts failed", {
      id,
      maxRetries,
      duration,
      error: lastError,
    });

    return {
      success: false,
      user: null,
      cars: null,
      message: `Error fetching user data after ${maxRetries} attempts: ${lastError?.message || "Unknown error"}`,
    };
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

      const db = getDb();
      if (!db) {
        return {
          success: false,
          message: "Database connection not available",
        };
      }

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
      revalidatePath("/admin/users");

      return {
        success: true,
        message: `User ${isDeleted.fullName || "Unknown"} was deleted successfully`,
      };
    } catch (error) {
      console.error("Error deleting the user:", error);
      return {
        success: false,
        message: "Error deleting the user",
      };
    }
  });
