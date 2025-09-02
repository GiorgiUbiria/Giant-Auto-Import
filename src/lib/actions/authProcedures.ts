import { createServerActionProcedure } from "zsa";
import { getAuth } from "@/lib/auth";

// Enhanced authentication procedure with better error handling and performance
export const authedProcedure = createServerActionProcedure().handler(
  async () => {
    const startTime = Date.now();

    try {
      const authResult = await getAuth();

      // Validate auth result structure
      if (!authResult || typeof authResult !== 'object') {
        console.error("authedProcedure: Invalid auth result structure");
        throw new Error("Authentication failed");
      }

      const { user, session } = authResult;

      // Explicit validation of user and session
      if (!user || typeof user !== 'object') {
        console.error("authedProcedure: No valid user found");
        throw new Error("User not authenticated");
      }

      if (!session || typeof session !== 'object') {
        console.error("authedProcedure: No valid session found");
        throw new Error("Session not valid");
      }

      // Validate required user properties
      if (!user.id || typeof user.id !== 'string') {
        console.error("authedProcedure: Invalid user ID");
        throw new Error("Invalid user data");
      }

      // Log performance metrics in development
      if (process.env.NODE_ENV === "development") {
        console.log(`authedProcedure: Authentication completed in ${Date.now() - startTime}ms`);
      }

      return {
        user,
        session,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`authedProcedure: Authentication error after ${duration}ms:`, error);

      // Provide more specific error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          throw new Error("Authentication timeout - please try again");
        }
        if (error.message.includes("Database")) {
          throw new Error("Service temporarily unavailable");
        }
      }

      throw new Error("User not authenticated");
    }
  }
);

// Enhanced admin procedure with comprehensive role validation
export const isAdminProcedure = createServerActionProcedure().handler(
  async () => {
    const startTime = Date.now();

    try {
      const authResult = await getAuth();

      // Validate auth result structure
      if (!authResult || typeof authResult !== 'object') {
        console.error("isAdminProcedure: Invalid auth result structure");
        throw new Error("Authentication failed");
      }

      const { user, session } = authResult;

      // Explicit validation of user and session
      if (!user || typeof user !== 'object') {
        console.error("isAdminProcedure: No valid user found");
        throw new Error("User is not an admin");
      }

      if (!session || typeof session !== 'object') {
        console.error("isAdminProcedure: No valid session found");
        throw new Error("User is not an admin");
      }

      // Validate required user properties
      if (!user.id || typeof user.id !== 'string') {
        console.error("isAdminProcedure: Invalid user ID");
        throw new Error("Invalid user data");
      }

      // Enhanced role validation with logging
      if (!user.role || typeof user.role !== 'string') {
        console.error("isAdminProcedure: Invalid user role", {
          userRole: user.role,
          userId: user.id,
          userEmail: user.email
        });
        throw new Error("User is not an admin");
      }

      // Check for admin role with additional logging
      const validAdminRoles = ["ADMIN"];
      if (!validAdminRoles.includes(user.role)) {
        console.warn("isAdminProcedure: Access denied", {
          userRole: user.role,
          userId: user.id,
          userEmail: user.email,
          validRoles: validAdminRoles
        });
        throw new Error("User is not an admin");
      }

      // Log successful admin authentication in development
      if (process.env.NODE_ENV === "development") {
        console.log(`isAdminProcedure: Admin access granted in ${Date.now() - startTime}ms`, {
          userId: user.id,
          userRole: user.role
        });
      }

      return {
        user,
        session,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`isAdminProcedure: Admin authentication error after ${duration}ms:`, error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          throw new Error("Authentication timeout - please try again");
        }
        if (error.message.includes("Database")) {
          throw new Error("Service temporarily unavailable");
        }
      }

      throw new Error("User is not an admin");
    }
  }
);
