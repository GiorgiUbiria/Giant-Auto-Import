import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import type { Config } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/drizzle/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  driver: 'turso',
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_TURSO_DATABASE_URL! as string,
    authToken: process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN! as string,
  },
}) satisfies Config;
