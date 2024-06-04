"use server";

import { Argon2id } from "oslo/password";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { sql } from 'drizzle-orm';

import { generateId } from "lucia";

import { db } from "../drizzle/db";
import { userTable } from "../drizzle/schema";
import { lucia, validateRequest } from "@/lib/auth";

import type { ActionResult } from "@/lib/form";
import { SqliteError } from "better-sqlite3";
import { User, UserWithCarsAndSpecs } from "../interfaces";
import { getUser } from "./dbActions";
import { eq } from "drizzle-orm";

type NewUser = typeof userTable.$inferInsert;

const insertUser = async (user: NewUser) => {
  return db.insert(userTable).values(user);
};

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

  const existingUserQuery = await db.select().from(userTable).where(sql`${userTable.email} = ${email}`).limit(1);
  const existingUser = existingUserQuery[0] as User | undefined;

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

export async function signup(
  _: any,
  formData: FormData,
): Promise<ActionResult> {
  const { user } = await validateRequest();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
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

  const hashedPassword = (await new Argon2id().hash(password)) as string;

  const userId = generateId(15) as string;

  let roleId = 1;

  email === adminEmail ? (roleId = 2) : (roleId = 1);

  try {
    if (user) {
      if (user?.role_id === 1) {
        return redirect("/");
      } else {
        const user: NewUser = {
          id: userId,
          name,
          email,
          phone,
          password: hashedPassword,
          roleId,
        };
        await insertUser(user);
      }
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

export async function removeUser(id: string): Promise<ActionResult | undefined> {
  try {
    const user: UserWithCarsAndSpecs | undefined = await getUser(id);

    if (!user) {
      return {
        error: "User not found",
      };
    }

    const userId: { deletedId: string }[] = await db.delete(userTable).where(eq(userTable.id, id)).returning({ deletedId: userTable.id });

    if (!userId[0].deletedId) {
      return {
        error: "User ID is required for remove.",
      };
    }

    console.log(`User with ID ${userId[0].deletedId} removed successfully.`);
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to remove user from database",
    };
  }
}
