import RegisterForm from "@/components/register-form";
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
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <RegisterForm />
      </div>
    </div>
  );
}
