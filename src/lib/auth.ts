import { Lucia } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";

import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import type { Session, User } from "lucia";

import { z } from "zod";

import { getDb } from "./drizzle/db";
import { selectUserSchema, sessions, users } from "./drizzle/schema";

const AuthSchema = selectUserSchema.omit({ id: true, password: true, passwordText: true });
type AuthSchemaType = z.infer<typeof AuthSchema>;

// Define the authenticated user type with role
export type AuthenticatedUser = User & {
  role: string;
  fullName: string;
  email: string;
  phone: string;
  deposit: number;
  balance: number;
  priceList: string;
};

// Create adapter lazily to prevent client-side database access
let adapter: DrizzleSQLiteAdapter | null = null;
let lucia: Lucia<typeof AuthSchema> | null = null;

export function getLucia(): Lucia<typeof AuthSchema> {
  if (lucia) {
    return lucia;
  }

  // Ensure this only runs on the server side
  if (typeof window !== "undefined") {
    throw new Error("Lucia cannot be initialized on the client side");
  }

  if (!adapter) {
    try {
      const db = getDb();
      if (!db) {
        throw new Error("Database connection failed");
      }
      adapter = new DrizzleSQLiteAdapter(db, sessions as any, users as any);
    } catch (error) {
      console.error("Failed to create adapter:", error);
      throw new Error("Failed to initialize authentication adapter");
    }
  }

  if (!lucia) {
    try {
      lucia = new Lucia(adapter, {
        sessionCookie: {
          expires: false,
          attributes: {
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          },
        },
        getUserAttributes: (attributes) => {
          return {
            fullName: attributes.fullName || "",
            email: attributes.email || "",
            role: attributes.role || "CUSTOMER_SINGULAR",
            phone: attributes.phone || "",
            deposit: attributes.deposit || 0,
            balance: attributes.balance || 0,
            priceList: attributes.priceList || "[]",
          };
        },
      });
    } catch (error) {
      console.error("Failed to create Lucia instance:", error);
      throw new Error("Failed to initialize authentication");
    }
  }

  return lucia;
}

// Enhanced caching for authentication with better error handling
export const getAuth = cache(
  async (): Promise<{ user: AuthenticatedUser; session: Session } | { user: null; session: null }> => {
    try {
      const cookieStore = cookies();
      if (!cookieStore) {
        console.log("getAuth: No cookie store available");
        return { user: null, session: null };
      }

      const luciaInstance = getLucia();
      if (!luciaInstance) {
        console.error("getAuth: Failed to get Lucia instance");
        return { user: null, session: null };
      }

      // Safe session ID extraction
      const sessionCookie = cookieStore.get(luciaInstance.sessionCookieName);
      const sessionId = sessionCookie ? sessionCookie.value : null;

      if (!sessionId) {
        console.log("getAuth: No session ID found");
        return {
          user: null,
          session: null
        };
      }

      console.log("getAuth: Validating session", { sessionId: sessionId.substring(0, 10) + "..." });

      // Validate session with better error handling
      const result = await luciaInstance.validateSession(sessionId);

      // Safe user role extraction with fallbacks
      const userRole = result.user && typeof result.user === 'object' && 'role' in result.user
        ? (result.user as { role: string }).role
        : "CUSTOMER_SINGULAR";

      console.log("getAuth: Session validation result", {
        hasUser: !!result.user,
        hasSession: !!result.session,
        userRole: userRole
      });

      // Only update cookies if session is fresh or invalid
      if (result.session && result.session.fresh) {
        const sessionCookie = luciaInstance.createSessionCookie(result.session.id);
        cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        console.log("getAuth: Updated session cookie (fresh)");
      } else if (!result.session) {
        const sessionCookie = luciaInstance.createBlankSessionCookie();
        cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        console.log("getAuth: Cleared session cookie (invalid)");
      }

      return result as { user: AuthenticatedUser; session: Session } | { user: null; session: null };
    } catch (error) {
      console.error("getAuth: Authentication error:", error);

      // Clear invalid session cookie on error
      try {
        const luciaInstance = getLucia();
        if (luciaInstance) {
          const sessionCookie = luciaInstance.createBlankSessionCookie();
          cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
          console.log("getAuth: Cleared session cookie due to error");
        }
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
    Lucia: typeof getLucia;
    DatabaseUserAttributes: AuthSchemaType;
  }
}
