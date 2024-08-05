"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Argon2id } from "oslo/password";

import { generateId } from "lucia";

import { getAuth, lucia } from "@/lib/auth";
import { db } from "../drizzle/db";
import { insertUserSchema, selectUserSchema, users } from "../drizzle/schema";

import { SqliteError } from "better-sqlite3";
import { z } from "zod";
import { createServerAction, createServerActionProcedure } from "zsa";

const LoginSchema = selectUserSchema.pick({ email: true, password: true });
const RegisterSchema = insertUserSchema.omit({ id: true });

const authedProcedure = createServerActionProcedure()
  .handler(async () => {
    try {
      const { user } = await getAuth();

      return user;
    } catch {
      throw new Error("User not authenticated")
    }
  });

export const loginAction = createServerAction()
  .input(LoginSchema)
  .output(z.object({
    message: z.string().optional(),
    data: z.any().optional(),
    error: z.string().optional(),
    success: z.boolean(),
  }))
  .handler(async ({ input }) => {
    const { email, password } = input;

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!existingUser) {
      return {
        success: false,
        error: "User not found",
      }
    }

    const validPassword = await new Argon2id().verify(existingUser.password, password);
    if (!validPassword) {
      return {
        success: false,
        error: "Incorrect email or password",
      };
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return redirect("/");
  });

export const registerAction = authedProcedure
  .createServerAction()
  .input(RegisterSchema)
  .output(z.object({
    message: z.string().optional(),
    data: z.any().optional(),
    error: z.string().optional(),
    success: z.boolean(),
  }))
  .handler(async ({ input }) => {
    const { email, password, fullName, phone, role } = input;
    const hashedPassword = (await new Argon2id().hash(password));

    const userId = generateId(15) as string;

    try {
      await db
        .insert(users)
        .values({
          id: userId,
          email,
          phone,
          fullName,
          role,
          password: hashedPassword,
          passwordText: password,
        })

      return {
        success: true,
        error: "User registered successfully",
      };
    } catch (error) {
      if (error instanceof SqliteError && error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        return {
          success: false,
          error: "Email or Phone number already used",
        };
      }
      return {
        success: false,
        error: JSON.stringify(error),
      };
    }

    return redirect("/admin/users");
  });

//TODO: Update User action
