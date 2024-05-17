import Link from "next/link";

import { db } from "@/lib/db";
import { Argon2id } from "oslo/password";
import { cookies } from "next/headers";
import { lucia, validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Form } from "@/lib/form";
import { generateId } from "lucia";
import { SqliteError } from "better-sqlite3";

import type { ActionResult } from "@/lib/form";

export default async function Page() {
  const { user } = await validateRequest();
  if (user) {
    return redirect("/");
  }
  return (
    <>
      <h1>Create an account</h1>
      <Form action={signup}>
        <label htmlFor="name">Full Name</label>
        <input name="name" id="name" />
        <br />
        <label htmlFor="email">Email</label>
        <input name="email" id="email" />
        <br />
        <label htmlFor="phone">Phone Number</label>
        <input name="phone" id="phone" />
        <br />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
        <br />
        <button>Continue</button>
      </Form>
      <Link href="/login">Sign in</Link>
    </>
  );
}

async function signup(_: any, formData: FormData): Promise<ActionResult> {
  "use server";
  const username = formData.get("name");
  // username must be between 4 ~ 31 characters, and only consists of lowercase letters, 0-9, -, and _
  // keep in mind some database (e.g. mysql) are case insensitive
  if (
    typeof username !== "string" ||
    username.length < 3 ||
    username.length > 31 ||
    !/^[a-z0-9_-]+$/.test(username)
  ) {
    return {
      error: "Invalid username",
    };
  }
  
  const email = formData.get("email");
  const phone = formData.get("phone");

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

  try {
    db.prepare("INSERT INTO user (id, name, email, phone, password) VALUES(?, ?, ?)").run(
      userId,
      username,
      email,
      phone,
      hashedPassword,
    );

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );
  } catch (e) {
    if (e instanceof SqliteError && e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return {
        error: "Email or Phone number already used",
      };
    }
    return {
      error: "An unknown error occurred",
    };
  }
  return redirect("/");
}
