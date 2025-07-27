import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Client } from "./client";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Admin Panel | Giant Auto Import",
  description: "Manage your auto import business",
};

export default async function Page() {
  const { user } = await getAuth();
  if (!user || user.role !== "ADMIN") {
    return redirect("/");
  }

  const t = await getTranslations("AdminPanel");

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="border-b pb-6">
          <h1 className="text-4xl font-bold tracking-tight text-primary leading-tight">{t("title")}</h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            {t("subtitle")}
          </p>
        </header>
        
        <Client id={user.id} />
      </div>
    </main>
  );
}
