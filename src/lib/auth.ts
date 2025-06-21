import { Lucia } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";


import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import type { Session, User } from "lucia";

import { z } from "zod";

import { db } from "./drizzle/db";
import { selectUserSchema, sessions, users } from "./drizzle/schema";

const AuthSchema = selectUserSchema.omit({ id: true, });
type AuthSchemaType = z.infer<typeof AuthSchema>; 

const adapter = new DrizzleSQLiteAdapter(db, sessions as any, users as any);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      fullName: attributes.fullName,
      email: attributes.email,
      role: attributes.role,
    };
  },
});

export const getAuth = cache(
  async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
    try {
      const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
      if (!sessionId) {
        return {
          user: null,
          session: null
        };
      }

      // Use direct validation instead of unstable_cache in production to avoid caching issues
      const result = await lucia.validateSession(sessionId);

      try {
        if (result.session && result.session.fresh) {
          const sessionCookie = lucia.createSessionCookie(result.session.id);
          cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        }
        if (!result.session) {
          const sessionCookie = lucia.createBlankSessionCookie();
          cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        }
      } catch (cookieError) {
        console.error("Error setting cookies:", cookieError);
      }

      return result;
    } catch (error) {
      console.error("Authentication error:", error);
      return {
        user: null,
        session: null
      };
    }
  }
);

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: AuthSchemaType;
  }
}
