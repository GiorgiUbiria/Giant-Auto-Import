import { validateRequest } from "@/lib/auth";

export async function validateAdmin(): Promise<boolean> {
  const { user } = await validateRequest();
  if (!user || user?.role_id !== 2) {
    return false;
  }
  return true;
}

export async function validateUser(): Promise<boolean> {
  const { user } = await validateRequest();
  if (!user) {
    return false;
  }
  return true;
}

