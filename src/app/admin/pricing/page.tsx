import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { PricingManagementClient } from "./client";
import { Provider } from 'jotai';

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Pricing Management | Giant Auto Import",
  description: "Manage default and user-specific pricing configurations",
};

export default async function Page() {
  const { user } = await getAuth();
  if (!user || user.role !== "ADMIN") {
    return redirect("/");
  }

  return (
    <Provider>
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="border-b pb-6">
            <h1 className="text-4xl font-bold tracking-tight text-primary">Pricing Management</h1>
            <p className="text-muted-foreground mt-2">
              Configure default pricing and manage user-specific pricing overrides
            </p>
          </header>

          <PricingManagementClient />
        </div>
      </main>
    </Provider>
  );
} 