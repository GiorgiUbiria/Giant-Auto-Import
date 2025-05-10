import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Client } from "./client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | Giant Auto Import",
  description: "Manage your auto import business",
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
          <h1 className="text-4xl font-bold tracking-tight text-primary">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">
            Manage your auto import business efficiently
          </p>
        </header>
        
        <Client id={user.id} />
      </div>
    </main>
  );
}
