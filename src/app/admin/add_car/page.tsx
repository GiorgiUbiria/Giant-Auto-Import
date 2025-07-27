import { DynamicAddCarForm } from "@/components/dynamic-imports";
import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// Loading component for the page
const PageLoader = () => (
  <div className="w-full grid place-items-center mt-8">
    <div className="w-full md:w-2/3 space-y-8 my-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl text-primary my-4">Add Car</h1>
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Loading form...</span>
      </div>
    </div>
  </div>
);

export default async function Page() {
  const { user } = await getAuth();
  if (!user || user.role !== "ADMIN") {
    return redirect("/");
  }

  return (
    <div className="w-full grid place-items-center mt-8">
      <h1 className="text-3xl text-primary my-4">Add Car</h1>
      <Suspense fallback={<PageLoader />}>
        <DynamicAddCarForm />
      </Suspense>
    </div>
  )
}
