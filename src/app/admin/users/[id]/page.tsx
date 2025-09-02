import { redirect, notFound } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getUserAction } from "@/lib/actions/userActions";
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

  // Validate that the user exists before rendering the page
  try {
    const [result] = await getUserAction({ id: params.id });
    if (!result?.success || !result?.user) {
      console.log("User not found:", params.id);
      notFound();
    }
  } catch (error) {
    console.error("Error validating user:", error);
    notFound();
  }

  return (
    <UserDataProvider userId={params.id}>
      <Client id={params.id} />
    </UserDataProvider>
  );
}
