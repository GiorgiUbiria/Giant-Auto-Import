import { getAuth } from "@/lib/auth";
import { createServerActionProcedure } from "zsa";

export const authedProcedure = createServerActionProcedure()
  .handler(async () => {
    try {
      const { user, session } = await getAuth();

      return {
        user,
        session,
      };
    } catch {
      throw new Error("User not authenticated")
    }
  });

export const isAdminProcedure = createServerActionProcedure(authedProcedure)
  .handler(async ({ ctx }) => {
    const { user, session } = ctx;

    if (user?.role !== "ADMIN") {
      throw new Error("User is not an admin")
    }

    return {
      user,
      session,
    }
  });
