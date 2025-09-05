"use server";

import { getDb } from "../drizzle/db";
import { SqliteError } from "better-sqlite3";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Argon2id } from "oslo/password";
import { z } from "zod";
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
    const startTime = Date.now();

    try {
      const { email, password } = input;
      const normalizedEmail = email.toLowerCase();

      // Add input validation
      if (!email || !password) {
        return {
          success: false,
          message: "Email and password are required",
        };
      }

      const db = getDb();

      // Check if database connection is available
      if (!db) {
        console.error("Database connection not available for login");
        return {
          success: false,
          message: "Service temporarily unavailable",
        };
      }

      // Add timeout protection for database query
      const [existingUser] = (await Promise.race([
        db.select().from(users).where(eq(users.email, normalizedEmail)),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Database query timeout")), 10000)
        ),
      ])) as any;

      if (!existingUser) {
        // Log failed login attempt for security monitoring
        console.warn("Login attempt failed: User not found", {
          email: normalizedEmail,
        });
        return {
          success: false,
          message: "Invalid credentials",
        };
      }

      // Add timeout protection for password verification
      const validPassword = (await Promise.race([
        new Argon2id().verify(existingUser.password, password),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Password verification timeout")),
            5000
          )
        ),
      ])) as boolean;

      if (!validPassword) {
        // Log failed login attempt for security monitoring
        console.warn("Login attempt failed: Invalid password", {
          email: normalizedEmail,
          userId: existingUser.id,
        });
        return {
          success: false,
          message: "Invalid credentials",
        };
      }

      // Import lucia with proper error handling
      let lucia;
      try {
        const { getLucia } = await import("../auth");
        lucia = getLucia();
        if (!lucia) {
          throw new Error("Failed to get Lucia instance");
        }
      } catch (importError) {
        console.error("Failed to import or initialize Lucia:", importError);
        throw new Error("Authentication service unavailable");
      }

      // Create session with timeout protection
      const session = (await Promise.race([
        lucia.createSession(existingUser.id, {}),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session creation timeout")), 5000)
        ),
      ])) as any;

      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );

      // Log successful login
      console.log(`Login successful in ${Date.now() - startTime}ms`, {
        userId: existingUser.id,
        email: normalizedEmail,
        role: existingUser.role,
      });

      return {
        success: true,
        message: "Login successful",
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`Login error after ${duration}ms:`, error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          return {
            success: false,
            message: "Login timeout - please try again",
          };
        }
        if (error.message.includes("Database")) {
          return {
            success: false,
            message: "Service temporarily unavailable",
          };
        }
      }

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
    const db = getDb();

    // Check if database connection is available
    if (!db) {
      console.error("Database connection not available for user registration");
      return {
        success: false,
        message: "Service temporarily unavailable",
      };
    }

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

      // Revalidate admin users list
      revalidatePath("/admin/users");

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

    // Import lucia dynamically to avoid client-side issues
    // Import lucia with proper error handling
    let lucia;
    try {
      const { getLucia } = await import("../auth");
      lucia = getLucia();
      if (!lucia) {
        throw new Error("Failed to get Lucia instance");
      }
    } catch (importError) {
      console.error("Failed to import or initialize Lucia:", importError);
      throw new Error("Authentication service unavailable");
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
      const db = getDb();

      // Check if database connection is available
      if (!db) {
        console.error("Database connection not available for user update");
        return {
          success: false,
          message: "Service temporarily unavailable",
        };
      }

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

      revalidatePath(`/admin/users/user/${id}`);

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
