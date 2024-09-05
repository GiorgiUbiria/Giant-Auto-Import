import { createClient } from "@libsql/client/web";
import { LibSQLDatabase, drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export function tursoClient(): LibSQLDatabase<typeof schema> {
  if (typeof process === "undefined") {
    throw new Error(
      "process is not defined. Are you trying to run this on the client?"
    );
  }

  const url = process.env.NEXT_PUBLIC_TURSO_DATABASE_URL?.trim();
  if (url === undefined) {
    throw new Error("TURSO_URL is not defined");
  }

  const authToken = process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN?.trim();
  if (authToken === undefined && !url.includes("file:")) {
    throw new Error("TURSO_AUTH_TOKEN is not defined");
  }

  return drizzle(
    createClient({
      url,
      authToken,
    }),
    { schema, logger: process.env.NODE_ENV !== "production" }
  );
}

export const db = tursoClient();
