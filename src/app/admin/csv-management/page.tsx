import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { CsvManagementClient } from "./client";

export const metadata: Metadata = {
  title: "CSV Management | Giant Auto Import",
  description: "Manage CSV pricing data and versions",
};

export default async function Page() {
  const { user } = await getAuth();
  if (!user || user.role !== "ADMIN") {
    return redirect("/");
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="border-b pb-6">
          <h1 className="text-4xl font-bold tracking-tight text-primary">CSV Management</h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage CSV pricing data for ground fees
          </p>
        </header>
        
        <CsvManagementClient />
      </div>
    </main>
  );
} 