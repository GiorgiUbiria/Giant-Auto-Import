"use server";

import { Argon2id } from "oslo/password";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { generateId } from "lucia";

import { db } from "../drizzle/db";
import { userTable } from "../drizzle/schema";
import { lucia, validateRequest } from "@/lib/auth";

import type { ActionResult } from "@/lib/form";
import { SqliteError } from "better-sqlite3";
import { UserWithCarsAndSpecs } from "../interfaces";
import { getUser } from "./dbActions";
import { isValidPhoneNumber } from 'libphonenumber-js';

type NewUser = typeof userTable.$inferInsert;

const insertUser = async (user: NewUser) => {
  return db.insert(userTable).values(user);
};

export async function getPdfToken(): Promise<string> {
  const { user } = await validateRequest();
  if (!user) {
    return "";
  }

  return user.pdf_token;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: any;
}

async function validateEmail(email: string): Promise<boolean> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function validatePassword(password: string): Promise<boolean> {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

async function validateName(name: string): Promise<boolean> {
  const nameRegex = /^[a-zA-Z ]+$/;
  return nameRegex.test(name);
}

async function validatePhone(phone: string): Promise<boolean> {
  return isValidPhoneNumber(phone, 'GE');
}

async function validateLogin(email: string, password: string): Promise<ValidationResult> {
  if (!await validateEmail(email)) {
    return {
      valid: false,
      error: "Invalid email",
    };
  }

  if (!await validatePassword(password)) {
    return {
      valid: false,
      error: "Invalid password",
    };
  }

  const user = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1)
    .get();

  if (!user) {
    return {
      valid: false,
      error: "Incorrect email or password",
    };
  }

  const validPassword = await new Argon2id().verify(
    user.password,
    password
  );
  if (!validPassword) {
    return {
      valid: false,
      error: "Incorrect email or password",
    };
  }

  return {
    valid: true,
    data: user,
  };
}

export async function login(_: any, formData: FormData): Promise<ActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!await validateLogin(email, password)) {
    return {
      error: "Incorrect email or password",
    };
  }

  const { valid, data } = await validateLogin(email, password);

  if (!valid) {
    return {
      error: "Incorrect email or password",
    };
  }

  const session = await lucia.createSession(data.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  );

  return redirect("/");
}

async function validateSignUp(name: string, email: string, phone: string, password: string): Promise<ValidationResult> {
  const user = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1)
    .get();

  if (user) {
    return {
      valid: false,
      error: "User with this email already exists",
    };
  }

  if (!await validateName(name)) {
    return {
      valid: false,
      error: "Invalid name",
    };
  }
  if (!await validateEmail(email)) {
    return {
      valid: false,
      error: "Invalid email",
    };
  }
  if (!await validatePhone(phone)) {
    return {
      valid: false,
      error: "Invalid phone",
    };
  }
  if (!await validatePassword(password)) {
    return {
      valid: false,
      error: "Invalid password",
    };
  }
  return {
    valid: true,
  };
}

export async function signup(
  _: any,
  formData: FormData,
): Promise<ActionResult | undefined> {
  const { user } = await validateRequest();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  const { valid, error } = await validateSignUp(name, email, phone, password);

  if (!valid) {
    return {
      error: error!,
    };
  }

  const hashedPassword = (await new Argon2id().hash(password)) as string;

  const userId = generateId(15) as string;

  let currentRoleId = user?.role_id;

  if (currentRoleId !== 2) {
    return {
      error: "Only admins can register new users.",
    };
  }

  try {
    if (currentRoleId === 2) {
      const newUser: NewUser = {
        id: userId,
        name,
        email,
        phone,
        password: hashedPassword,
        roleId: 1,
      };
      await insertUser(newUser);
    } else {
      return {
        error: "Only admins can register new users.",
      };
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

  return redirect("/admin/users");
}

export async function updateUser(
  id: string,
  formData: FormData,
): Promise<ActionResult | undefined> {
  try {
    const user: UserWithCarsAndSpecs | undefined = await getUser(id);

    if (!user) {
      return {
        error: "User not found",
      };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;

    const newUser: NewUser = {
      id: user.user.id,
      name: name,
      email: email,
      phone: phone,
      password: password,
      roleId: user.user.roleId,
    };

    await db.update(userTable).set(newUser).where(eq(userTable.id, id));

    console.log(`User with ID ${id} updated successfully.`);
  } catch (error) {
    console.error(error);
    return {
      error: "Failed to update user in database",
    };
  }
}
