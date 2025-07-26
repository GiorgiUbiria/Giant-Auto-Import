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

// Enhanced caching for authentication
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

      // Validate session with better error handling
      const result = await lucia.validateSession(sessionId);

      // Only update cookies if session is fresh or invalid
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      } else if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      }

      return result;
    } catch (error) {
      // Only log in development to reduce noise
      if (process.env.NODE_ENV === "development") {
        console.error("Authentication error:", error);
      }
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
