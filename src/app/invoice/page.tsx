import PdfSelect from "@/components/pdf-select";
import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

export default async function Page() {
  const { user } = await getAuth();
  if (!user || user.role !== "ADMIN") {
    return redirect("/");
  }

  return (
    <PdfSelect user={user} />
  );
}
