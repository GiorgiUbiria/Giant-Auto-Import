import { createClient } from "@libsql/client/web";
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

  if (typeof process === "undefined") {
    throw new Error(
      "process is not defined. Are you trying to run this on the client?"
    );
  }

  // Use proper server-side environment variables
  const url = process.env.TURSO_DATABASE_URL?.trim();
  if (!url) {
    console.error("Database configuration error: TURSO_DATABASE_URL is not defined");
    throw new Error("TURSO_DATABASE_URL is not defined");
  }

  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
  if (!authToken && !url.includes("file:")) {
    console.error("Database configuration error: TURSO_AUTH_TOKEN is not defined");
    throw new Error("TURSO_AUTH_TOKEN is not defined");
  }

  // Only log in development
  if (process.env.NODE_ENV === "development") {
    console.log("Database configuration:", {
      url: url ? "SET" : "MISSING",
      authToken: authToken ? "SET" : "MISSING",
      environment: process.env.NODE_ENV
    });
  }

  try {
    dbInstance = drizzle(
      createClient({
        url,
        authToken,
      }),
      { 
        schema, 
        logger: process.env.NODE_ENV === "development" // Only log in development
      }
    );
    
    return dbInstance;
  } catch (error) {
    console.error("Failed to create database client:", error);
    throw error;
  }
}

// Export the cached instance
export const db = tursoClient();
