"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Argon2id } from "oslo/password";

import { generateId } from "lucia";

import { getAuth, lucia } from "@/lib/auth";
import { db } from "../drizzle/db";
import { insertUserSchema, selectUserSchema, users } from "../drizzle/schema";

import { ActionResult } from "@/lib/utils";
import { SqliteError } from "better-sqlite3";
import { z } from "zod";

const LoginSchema = selectUserSchema.pick({ email: true, password: true });
type LoginValues = z.infer<typeof LoginSchema>;
const RegisterSchema = insertUserSchema.omit({id: true});
type RegisterValues = z.infer<typeof RegisterSchema>;

export async function getPdfToken(): Promise<string> {
  const { user } = await getAuth();
  if (!user) {
    return "";
  }

  return user.pdf_token;
}

export async function login(values: LoginValues): Promise<ActionResult> {
  const result = LoginSchema.safeParse(values);
  if (!result.success) {
    return {
      success: false,
      error: result.error.message
    };
  }

  const { email, password } = result.data;

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
}

export async function signup(values: RegisterValues): Promise<ActionResult> {
  const result = RegisterSchema.safeParse(values);
  if (!result.success) {
    return {
      success: false,
      error: result.error.message
    };
  }

  const { email, password, fullName, phone, role } = result.data;

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
}

//TODO: Update User action
