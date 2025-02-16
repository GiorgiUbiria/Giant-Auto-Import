import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Client } from "./client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Giant Auto Import",
  description: "Manage and track your imported vehicles",
};

export default async function DashboardPage() {
  const { user } = await getAuth();
  
  if (!user) {
    redirect("/");
  }

  return (
    <main className="container mx-auto">
      <div className="flex flex-col gap-6">
        <header className="pt-6">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and track your imported vehicles
          </p>
        </header>
        
        <Client userId={user.id} />
      </div>
    </main>
  );
}
