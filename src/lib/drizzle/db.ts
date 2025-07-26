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

  if (typeof process === "undefined") {
    throw new Error(
      "process is not defined. Are you trying to run this on the client?"
    );
  }

  const url = process.env.NEXT_PUBLIC_TURSO_DATABASE_URL?.trim();
  if (url === undefined) {
    console.error("Database configuration error: TURSO_URL is not defined");
    throw new Error("TURSO_URL is not defined");
  }

  const authToken = process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN?.trim();
  if (authToken === undefined && !url.includes("file:")) {
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
        logger: false // Disable verbose query logging
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
