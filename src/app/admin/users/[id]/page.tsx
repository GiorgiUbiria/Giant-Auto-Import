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

  // Fetch all data server-side
  const [userDataResult] = await getAdminUserPageDataAction({ id: params.id });

  // Handle null result
  if (!userDataResult) {
    console.log("Page: No result from server action", params.id);
    return redirect("/admin/users");
  }

  // Handle user not found
  if (!userDataResult.success || !userDataResult.user) {
    console.log("Page: User not found", params.id);
    notFound();
  }

  // Handle errors
  if (!userDataResult.success) {
    console.error("Page: Error fetching user data", userDataResult.message);
    // For now, redirect to users list on error
    // In a real app, you might want to show an error page
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
}
