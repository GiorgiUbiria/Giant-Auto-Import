import { createClient } from "@libsql/client";
import { LibSQLDatabase, drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Global database instance for connection pooling
let dbInstance: LibSQLDatabase<typeof schema> | null = null;

export function tursoClient(): LibSQLDatabase<typeof schema> {
  // Return cached instance if available
  if (dbInstance) {
    return dbInstance;
  }

  // Ensure this only runs on the server side
  if (typeof window !== "undefined") {
    throw new Error(
      "Database connection cannot be established on the client side"
    );
  }

  // Check if we're in a build environment
  if (process.env.NEXT_PHASE === "phase-production-build") {
    console.log("Database: Skipping connection during build phase");
    // Return a mock database instance for build time
    return {} as LibSQLDatabase<typeof schema>;
  }

  if (typeof process === "undefined") {
    throw new Error(
      "process is not defined. Are you trying to run this on the client?"
    );
  }

  // Use proper server-side environment variables with better validation
  const url = process.env.TURSO_DATABASE_URL?.trim();
  if (!url) {
    console.error(
      "Database configuration error: TURSO_DATABASE_URL is not defined"
    );
    console.error(
      "Available env vars:",
      Object.keys(process.env).filter((key) => key.includes("TURSO"))
    );
    throw new Error("TURSO_DATABASE_URL is not defined");
  }

  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
  if (!authToken && !url.includes("file:")) {
    console.error(
      "Database configuration error: TURSO_AUTH_TOKEN is not defined"
    );
    console.error(
      "Available env vars:",
      Object.keys(process.env).filter((key) => key.includes("TURSO"))
    );
    throw new Error("TURSO_AUTH_TOKEN is not defined");
  }

  // Only log in development
  if (process.env.NODE_ENV === "development") {
    console.log("Database configuration:", {
      url: url ? "SET" : "MISSING",
      authToken: authToken ? "SET" : "MISSING",
      environment: process.env.NODE_ENV,
    });
  }

  try {
    // Validate URL format
    if (!url.startsWith("libsql://") && !url.startsWith("file:")) {
      throw new Error("Invalid database URL format");
    }

    const client = createClient({
      url,
      authToken,
    });

    // Test the connection
    if (process.env.NODE_ENV === "production") {
      console.log("Database: Testing connection...");
    }

    dbInstance = drizzle(client, {
      schema,
      logger: process.env.NODE_ENV === "development", // Only log in development
    });

    if (process.env.NODE_ENV === "production") {
      console.log("Database: Connection established successfully");
    }

    return dbInstance;
  } catch (error) {
    console.error("Failed to create database client:", error);
    throw new Error(
      `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Export a function that safely gets the database instance
export function getDb(): LibSQLDatabase<typeof schema> | null {
  // Build-time safety - don't attempt connection during build
  if (process.env.NEXT_PHASE === "phase-production-build") {
    console.log("Database: Skipping connection during build phase");
    return null;
  }

  try {
    return tursoClient();
  } catch (error) {
    console.error("Failed to get database instance:", error);

    // In production, return null instead of throwing to prevent app crashes
    if (process.env.NODE_ENV === "production") {
      console.warn("Database connection failed, returning null");
      return null;
    }

    throw new Error("Database connection failed");
  }
}

// Export a lazy database instance that only connects when needed
export const db = new Proxy({} as LibSQLDatabase<typeof schema>, {
  get(target, prop) {
    const dbInstance = getDb();
    if (!dbInstance) {
      throw new Error("Database connection not available");
    }
    return (dbInstance as any)[prop];
  },
});
