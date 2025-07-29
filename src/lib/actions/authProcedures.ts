import { getAuth } from "@/lib/auth";
import { createServerActionProcedure } from "zsa";

// Simplified authentication procedure - direct getAuth call
export const authedProcedure = createServerActionProcedure().handler(
  async () => {
    try {
      const { user, session } = await getAuth();
      
      if (!user || !session) {
        throw new Error("User not authenticated");
      }

      return {
        user,
        session,
      };
    } catch (error) {
      console.error("Authentication error:", error);
      throw new Error("User not authenticated");
    }
  }
);

// Simplified admin procedure - direct getAuth call
export const isAdminProcedure = createServerActionProcedure().handler(
  async () => {
    try {
      const { user, session } = await getAuth();
      
      if (!user || !session) {
        throw new Error("User not authenticated");
      }

      if (user.role !== "ADMIN") {
        throw new Error("User is not an admin");
      }

      return {
        user,
        session,
      };
    } catch (error) {
      console.error("Admin authentication error:", error);
      throw new Error("User is not an admin");
    }
  }
);
