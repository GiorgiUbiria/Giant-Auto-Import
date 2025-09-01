import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Client } from "./client";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ErrorBoundary from "@/components/ui/error-boundary";

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';



export const metadata: Metadata = {
  title: "Admin Panel | Giant Auto Import",
  description: "Manage your auto import business",
};

export default async function Page() {
  try {
    const authResult = await getAuth();

    // Safe destructuring with fallbacks
    const user = authResult?.user || null;

    if (!user || typeof user !== 'object' || user.role !== "ADMIN") {
      console.log("Admin page: User not authenticated or not admin", {
        hasUser: !!user,
        userRole: user?.role
      });
      return redirect("/");
    }

    const t = await getTranslations("AdminPanel");

    return (
      <ErrorBoundary>
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <header className="border-b-2 border-gray-300 dark:border-gray-600 pb-6">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight drop-shadow-sm">
                {t("title")}
              </h1>
              <p className="text-gray-700 dark:text-gray-200 mt-2 leading-relaxed font-medium">
                {t("subtitle")}
              </p>
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <Client id={user.id} />
              </div>
            </div>
          </div>
        </main>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("Admin page error:", error);
    return redirect("/");
  }
}
