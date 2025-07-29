import { Lucia } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";

import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import type { Session, User } from "lucia";

import { z } from "zod";

import { db } from "./drizzle/db";
import { selectUserSchema, sessions, users } from "./drizzle/schema";

const AuthSchema = selectUserSchema.omit({ id: true, password: true, passwordText: true });
type AuthSchemaType = z.infer<typeof AuthSchema>; 

const adapter = new DrizzleSQLiteAdapter(db, sessions as any, users as any);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      fullName: attributes.fullName,
      email: attributes.email,
      role: attributes.role,
      phone: attributes.phone,
      deposit: attributes.deposit,
      balance: attributes.balance,
      priceList: attributes.priceList,
    };
  },
});

// Enhanced caching for authentication with better error handling
export const getAuth = cache(
  async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
    try {
      const cookieStore = cookies();
      const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
      
      if (!sessionId) {
        console.log("getAuth: No session ID found");
        return {
          user: null,
          session: null
        };
      }

      console.log("getAuth: Validating session", { sessionId: sessionId.substring(0, 10) + "..." });

      // Validate session with better error handling
      const result = await lucia.validateSession(sessionId);

      console.log("getAuth: Session validation result", { 
        hasUser: !!result.user, 
        hasSession: !!result.session,
        userRole: (result.user as any)?.role 
      });

      // Only update cookies if session is fresh or invalid
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        console.log("getAuth: Updated session cookie (fresh)");
      } else if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        console.log("getAuth: Cleared session cookie (invalid)");
      }

      return result;
    } catch (error) {
      console.error("getAuth: Authentication error:", error);
      
      // Clear invalid session cookie on error
      try {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        console.log("getAuth: Cleared session cookie due to error");
      } catch (cookieError) {
        console.error("getAuth: Failed to clear session cookie:", cookieError);
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
