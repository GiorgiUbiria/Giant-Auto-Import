import PdfSelect from "@/components/pdf-select";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/");
  }

  return (
    <PdfSelect user={user} />
  );
}
