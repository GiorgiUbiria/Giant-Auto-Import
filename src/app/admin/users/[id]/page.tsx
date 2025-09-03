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
  const { user } = await getAuth();
  if (!user || user.role !== "ADMIN") {
    return redirect("/");
  }

  // Fetch all data server-side with retry logic
  const [userDataResult] = await getAdminUserPageDataAction({ id: params.id });

  // Handle null result or missing user data
  if (!userDataResult || !userDataResult.user) {
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
