import { validateRequest } from "@/lib/auth";
import { User } from "./interfaces";
import { userTable } from "./drizzle/schema";
import { db } from "./drizzle/db";
import { eq } from "drizzle-orm";
import { DbUser } from "./actions/dbActions";

type AuthValidationResult = {
  user: DbUser | null;
  valid: boolean;
}

export async function validateAdmin(): Promise<AuthValidationResult> {
  const { user } = await validateRequest();

  if (!user || user?.role_id !== 2) {
    return {
      user: null,
      valid: false,
    }
  }

  const adminUser = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, user.id))
    .limit(1)
    .get();

  if (!adminUser) {
    return {
      user: null,
      valid: false,
    }
  }

  return {
    user: adminUser,
    valid: true,
  };
}

export async function validateUser(): Promise<boolean> {
  const { user } = await validateRequest();
  if (!user) {
    return false;
  }
  return true;
}

