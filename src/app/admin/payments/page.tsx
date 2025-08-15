import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { Client } from "./client";

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Payment Management | Giant Auto Import",
  description: "Manage customer payments and invoices",
};

export default async function PaymentsPage() {
  const { user } = await getAuth();
  
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6">
        <header className="px-4 md:px-6 pt-6">
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground">
            Manage customer payments and generate invoices
          </p>
        </header>
        
        <Client />
      </div>
    </div>
  );
}
