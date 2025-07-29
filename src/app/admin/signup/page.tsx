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
    <div className="w-full grid place-items-center">
      <h1 className="text-3xl text-primary my-4"> Register User </h1>
      <RegisterForm />
    </div>
  );
}
