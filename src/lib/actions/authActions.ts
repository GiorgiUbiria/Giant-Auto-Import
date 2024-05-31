"use server";

import { Argon2id } from "oslo/password";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { generateId } from "lucia";

import { db } from "@/lib/db";
import { lucia, validateRequest } from "@/lib/auth";

import type { DatabaseUser } from "@/lib/db";
import type { ActionResult } from "@/lib/form";
import { SqliteError } from "better-sqlite3";

export async function login(_: any, formData: FormData): Promise<ActionResult> {
  const email = formData.get("email");
  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return {
      error: "Invalid password",
    };
  }

  const existingUser = db
    .prepare("SELECT * FROM user WHERE email = ?")
    .get(email) as DatabaseUser | undefined;
  if (!existingUser) {
    return {
      error: "Incorrect email or password",
    };
  }

  const validPassword = await new Argon2id().verify(
    existingUser.password,
    password,
  );
  if (!validPassword) {
    return {
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

export async function signup(_: any, formData: FormData): Promise<ActionResult> {
  const { user } = await validateRequest();
  const name = formData.get("name");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const adminEmail = process.env.ADMIN_EMAIL!;

  const password = formData.get("password");
  if (
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 255
  ) {
    return {
      error: "Invalid password",
    };
  }

  const hashedPassword = await new Argon2id().hash(password);
  const userId = generateId(15);

  let roleId = 1;

  email === adminEmail ? (roleId = 2) : (roleId = 1);

  try {
    if (user?.role_id === 1) {
      db.prepare(
        "INSERT INTO user (id, name, email, phone, password, role_id) VALUES(?, ?, ?, ?, ?, ?)",
      ).run(userId, name, email, phone, hashedPassword, roleId);

      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      );
    } else {
      db.prepare(
        "INSERT INTO user (id, name, email, phone, password, role_id) VALUES(?, ?, ?, ?, ?, ?)",
      ).run(userId, name, email, phone, hashedPassword, roleId);
    }
  } catch (e) {
    if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return {
        error: "Email or Phone number already used",
      };
    }
    return {
      error: JSON.stringify(e),
    };
  }

  if (user?.role_id === 2) {
    return redirect("/admin");
  }
  return redirect("/");
}
