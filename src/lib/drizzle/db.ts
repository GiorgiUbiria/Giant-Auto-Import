import { createClient } from "@libsql/client/web";
import 'dotenv/config';
import { LibSQLDatabase, drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export function tursoClient(): LibSQLDatabase<typeof schema> {
  const url = process.env.NEXT_PUBLIC_TURSO_DATABASE_URL?.trim();
  if (url === undefined) {
    throw new Error('TURSO_URL is not defined', url);
  }

  const authToken = process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN?.trim();
  if (authToken === undefined) {
    if (!url.includes('file:')) {
      throw new Error('TURSO_AUTH_TOKEN is not defined');
    }
  }

  return drizzle(
    createClient({
      url,
      authToken
    }),
    { schema, logger: true }
  );
}

export const db = tursoClient();
