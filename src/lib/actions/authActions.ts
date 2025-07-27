"use server";

import { lucia } from "@/lib/auth";
import { SqliteError } from "better-sqlite3";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Argon2id } from "oslo/password";
import { z } from "zod";
import { db } from "../drizzle/db";
import { insertUserSchema, users } from "../drizzle/schema";
import { authedProcedure, isAdminProcedure } from "./authProcedures";
import { createServerAction } from "zsa";

const LoginSchema = insertUserSchema.pick({ email: true, password: true });
const RegisterSchema = insertUserSchema.omit({ id: true });

export const loginAction = createServerAction()
  .input(LoginSchema)
  .output(
    z.object({
      message: z.string().optional(),
      data: z.any().optional(),
      success: z.boolean(),
    })
  )
  .handler(async ({ input }) => {
    try {
      const { email, password } = input;
      const normalizedEmail = email.toLowerCase();

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail));

      if (!existingUser) {
        return {
          success: false,
          message: "Invalid credentials",
        };
      }

      const validPassword = await new Argon2id().verify(
        existingUser.password,
        password
      );
      if (!validPassword) {
        return {
          success: false,
          message: "Invalid credentials",
        };
      }

      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );

      return {
        success: true,
        message: "Login successful",
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      };
    }
  });

export const registerAction = isAdminProcedure
  .createServerAction()
  .input(RegisterSchema)
  .output(
    z.object({
      message: z.string().optional(),
      data: z.any().optional(),
      success: z.boolean(),
    })
  )
  .handler(async ({ input }) => {
    const { email, password, fullName, phone, role } = input;
    const normalizedEmail = email.toLowerCase();
    const hashedPassword = await new Argon2id().hash(password);

    const userId = generateId(15) as string;

    try {
      await db.insert(users).values({
        id: userId,
        email: normalizedEmail,
        phone,
        fullName,
        role,
        password: hashedPassword,
        passwordText: password,
      });

      return {
        success: true,
        message: "User registered successfully",
      };
    } catch (error) {
      if (
        error instanceof SqliteError &&
        error.code === "SQLITE_CONSTRAINT_UNIQUE"
      ) {
        return {
          success: false,
          message: "Email or Phone number already used",
        };
      }
      return {
        success: false,
        message: JSON.stringify(error),
      };
    }
  });

export const logoutAction = authedProcedure
  .createServerAction()
  .handler(async ({ ctx }) => {
    const { session } = ctx;

    if (session === null) {
      throw new Error("Session not found");
    }

    await lucia.invalidateSession(session.id);

    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return redirect("/login");
  });

export const updateUserAction = isAdminProcedure
  .createServerAction()
  .input(
    z.object({
      id: z.string(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      fullName: z.string().optional(),
      role: z
        .enum([
          "CUSTOMER_DEALER",
          "CUSTOMER_SINGULAR",
          "MODERATOR",
          "ACCOUNTANT",
          "ADMIN",
        ])
        .optional(),
      passwordText: z.string().optional(),
    })
  )
  .output(
    z.object({
      message: z.string().optional(),
      data: z.any().optional(),
      success: z.boolean(),
    })
  )
  .handler(async ({ input }) => {
    const { id, email, passwordText: password, fullName, phone, role } = input;
    const updateData: any = {};

    if (email) updateData.email = email.toLowerCase();
    if (phone) updateData.phone = phone;
    if (fullName) updateData.fullName = fullName;
    if (role) updateData.role = role;

    if (password) {
      const hashedPassword = await new Argon2id().hash(password);
      updateData.password = hashedPassword;
      updateData.passwordText = password;
    }

    try {
      const updatedUser = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();

      if (!updatedUser) {
        return {
          success: false,
          message: "User update failed",
        };
      }

      revalidatePath(`/admin/users/${id}`);

      return {
        success: true,
        message: "User updated successfully",
      };
    } catch (error) {
      if (
        error instanceof SqliteError &&
        error.code === "SQLITE_CONSTRAINT_UNIQUE"
      ) {
        return {
          success: false,
          message: "Email or Phone number already used",
        };
      }
      return {
        success: false,
        message: JSON.stringify(error),
      };
    }
  });
