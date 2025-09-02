import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AddCarForm } from "@/components/add-car-form";
import ErrorBoundary from "@/components/ui/error-boundary";

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  const { user } = await getAuth();
  if (!user || user.role !== "ADMIN") {
    console.log("Add car page: User not authenticated or not admin", {
      hasUser: !!user,
      userRole: user?.role
    });
    redirect("/");
  }

  return (
    <ErrorBoundary>
      <div className="w-full grid place-items-center mt-8">
        <h1 className="text-3xl text-primary my-4">Add Car</h1>
        <AddCarForm />
      </div>
    </ErrorBoundary>
  );
}
