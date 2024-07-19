import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user || user?.role_id !== 2) {
    return redirect("/");
  }

  return (
    <div>
      <h1>Admin Page</h1>
    </div>
  );
}
