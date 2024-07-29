import { Lucia } from "lucia";
import { cookies } from "next/headers";
import { cache } from "react";
import { randomBytes } from "crypto";

import type { Session, User } from "lucia";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";

import { z } from "zod";

import { db } from "./drizzle/db";
import { selectUserSchema, sessions, users } from "./drizzle/schema";

const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

const generateToken = randomBytes(32).toString("hex");

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
      pdf_token: generateToken,
    };
  },
});

export const getAuth = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId =
      cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const result = await lucia.validateSession(sessionId);

    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(
          result.session.id
        );
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes
        );
      }
    } catch { }
    return result;
  }
);

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<z.infer<typeof selectUserSchema>, "id">;
  }
}
