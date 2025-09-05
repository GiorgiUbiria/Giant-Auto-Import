import { redirect, notFound } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getAdminUserPageDataAction } from "@/lib/actions/userActions";
import { Client } from "./client";
import { UserDataProvider } from "./user-data-provider";
import { z } from "zod";
import { selectUserSchema, selectCarSchema } from "@/lib/drizzle/schema";

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
  console.log("Admin user page rendering for ID:", params.id);

  try {
    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      console.log("User not authenticated or not admin, redirecting to home");
      return redirect("/");
    }

    console.log("User authenticated, fetching user data for:", params.id);

    // Fetch all data server-side with retry logic
    let userDataResult: AdminUserPageData | null = null;
    try {
      const [result, error] = await getAdminUserPageDataAction({ id: params.id });

      if (error) {
        console.error("Server action returned error:", error);
        notFound();
      }

      userDataResult = result as AdminUserPageData;

      console.log("getAdminUserPageDataAction result:", {
        hasResult: !!userDataResult,
        success: userDataResult?.success,
        hasUser: !!userDataResult?.user,
        userId: userDataResult?.user?.id,
        message: userDataResult?.message
      });
    } catch (actionError) {
      console.error("Error calling getAdminUserPageDataAction:", actionError);
      notFound();
    }

    // Handle null result or missing user data
    if (!userDataResult || !userDataResult.success || !userDataResult.user) {
      console.log("User not found, showing not found page:", {
        id: params.id,
        hasResult: !!userDataResult,
        success: userDataResult?.success,
        hasUser: !!userDataResult?.user,
        message: userDataResult?.message
      });
      notFound();
    }

    console.log("User data found, rendering page for:", userDataResult.user.id);

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
    console.error("Error in admin user page:", error);
    notFound();
  }
}
