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
  const { user } = await getAuth();
  if (!user || user.role !== "ADMIN") {
    return redirect("/");
  }

  try {
    // Fetch all data server-side with retry logic
    const [userDataResult] = await getAdminUserPageDataAction({ id: params.id });

    // Handle null result
    if (!userDataResult) {
      console.log("Page: No result from server action", params.id);
      return redirect("/admin/users");
    }

    // Handle errors first (e.g., DB/connectivity/auth) — avoid 404 on failures
    if (!userDataResult.success) {
      console.error("Page: Error fetching user data", userDataResult.message);
      return redirect("/admin/users");
    }

    // Handle user not found explicitly
    if (!userDataResult.user) {
      console.log("Page: User not found", params.id);
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
    console.error("Page: Unexpected error in page component", error);
    return redirect("/admin/users");
  }
}
