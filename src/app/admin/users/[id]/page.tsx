import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { Client } from "./client";
import { UserDataProvider } from "./user-data-provider";

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { id: string } }) {
  const { user } = await getAuth();
  if (!user || user.role !== "ADMIN") {
    return redirect("/");
  }
  return (
    <UserDataProvider userId={params.id}>
      <Client id={params.id} />
    </UserDataProvider>
  );
}
