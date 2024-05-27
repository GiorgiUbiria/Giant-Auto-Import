import { db } from "@/lib/db";
import { Argon2id } from "oslo/password";
import { cookies } from "next/headers";
import { lucia, validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Form } from "@/lib/form";
import { generateId } from "lucia";
import { SqliteError } from "better-sqlite3";

import type { ActionResult } from "@/lib/form";
import { RegisterForm } from "@/components/register-form";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user || (user && user.role_id !== 2)) {
    return redirect("/");
  }

  return (
    <div className="min-h-max py-16 lg:py-28 flex flex-col items-center justify-center gap-2">
      <Form action={signup}>
        <RegisterForm />
      </Form>
    </div>
  );
}

async function signup(_: any, formData: FormData): Promise<ActionResult> {
  "use server";
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
