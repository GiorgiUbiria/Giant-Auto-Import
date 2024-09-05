import { defineConfig } from "drizzle-kit";
import type { Config } from "drizzle-kit";

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

export default defineConfig({
  schema: "./src/lib/drizzle/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  driver: "turso",
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_TURSO_DATABASE_URL! as string,
    authToken: process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN! as string,
  },
}) satisfies Config;
