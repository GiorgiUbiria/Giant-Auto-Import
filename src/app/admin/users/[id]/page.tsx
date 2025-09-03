import { redirect } from "next/navigation";
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
  try {
    // Check if we're in a build environment
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.log("Skipping user page during build phase");
      return redirect("/admin/users");
    }

    const { user } = await getAuth();
    if (!user || user.role !== "ADMIN") {
      return redirect("/");
    }

    // Fetch all data server-side with retry logic
    let userDataResult;
    try {
      [userDataResult] = await getAdminUserPageDataAction({ id: params.id });
    } catch (actionError) {
      console.error("Error calling getAdminUserPageDataAction:", actionError);
      return redirect("/admin/users");
    }

    // Handle null result or missing user data
    if (!userDataResult || !userDataResult.user) {
      console.log("User not found, redirecting to users list:", params.id);
      return redirect("/admin/users");
    }

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
    return redirect("/admin/users");
  }
}
