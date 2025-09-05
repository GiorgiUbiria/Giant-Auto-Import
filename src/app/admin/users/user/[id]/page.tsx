import { redirect, notFound } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getAdminUserPageDataAction } from "@/lib/actions/userActions";
import { Client } from "./client";
import { UserDataProvider } from "./user-data-provider";
import { z } from "zod";
import { selectUserSchema, selectCarSchema } from "@/lib/drizzle/schema";
import logger from "@/lib/logger";

type AdminUserPageData = {
  success: boolean;
  user: z.infer<typeof selectUserSchema> | null;
  cars: z.infer<typeof selectCarSchema>[] | null;
  message?: string;
};

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;
export const runtime = 'nodejs';

export default async function Page({ params }: { params: { id: string } }) {
  logger.info("[admin.users.id] render start", { id: params.id });

  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      logger.warn("[admin.users.id] unauthorized access", { id: params.id, hasUser: !!user, role: user?.role });
      return redirect("/");
    }

    logger.info("[admin.users.id] fetching user data", { id: params.id });

    // Fetch all data server-side with retry logic
    let userDataResult: AdminUserPageData | null = null;
    try {
      const [result, error] = await getAdminUserPageDataAction({ id: params.id });

      if (error) {
        logger.error("[admin.users.id] getAdminUserPageDataAction error", { id: params.id, error });
        notFound();
      }

      userDataResult = result as AdminUserPageData;

      logger.info("[admin.users.id] data fetched", {
        id: params.id,
        hasResult: !!userDataResult,
        success: userDataResult?.success,
        hasUser: !!userDataResult?.user,
        userId: userDataResult?.user?.id,
      });
    } catch (actionError) {
      logger.error("[admin.users.id] action invocation failed", { id: params.id, error: actionError });
      notFound();
    }

    // Handle null result or missing user data
    if (!userDataResult || !userDataResult.success || !userDataResult.user) {
      logger.warn("[admin.users.id] user not found", {
        id: params.id,
        hasResult: !!userDataResult,
        success: userDataResult?.success,
        hasUser: !!userDataResult?.user,
      });
      notFound();
    }

    logger.info("[admin.users.id] render success", { id: params.id, foundId: userDataResult.user.id });

    return (
      <UserDataProvider
        userId={params.id}
        userData={userDataResult.user}
        carsData={userDataResult.cars || []}
      >
        <Client id={params.id} />
      </UserDataProvider>
    );
  } catch (error) {
    logger.error("[admin.users.id] render fatal error", { id: params.id, error });
    notFound();
  }
}
