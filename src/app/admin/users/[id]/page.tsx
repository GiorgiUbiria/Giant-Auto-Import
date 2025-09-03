import { redirect, notFound } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getAdminUserPageDataAction } from "@/lib/actions/userActions";
import { Client } from "./client";
import { UserDataProvider } from "./user-data-provider";

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const dynamicParams = true;

export default async function Page({ params }: { params: { id: string } }) {
  console.log("Admin user page rendering for ID:", params.id);

  try {
    // Check if we're in a build environment
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.log("Skipping user page during build phase");
      notFound();
    }

    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      console.log("User not authenticated or not admin, redirecting to home");
      return redirect("/");
    }

    console.log("User authenticated, fetching user data for:", params.id);

    // Fetch all data server-side with retry logic
    let userDataResult;
    try {
      const [result, error] = await getAdminUserPageDataAction({ id: params.id });

      if (error) {
        console.error("Server action returned error:", error);
        notFound();
      }

      userDataResult = result;

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
