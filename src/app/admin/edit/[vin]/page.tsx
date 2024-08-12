import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { Client } from "./client";

export default async function Page({ params }: { params: { vin: string } }) {
  const { user } = await getAuth();
  if (!user || user.role !== "ADMIN") {
    return redirect("/");
  }

  return (
    <Client vin={params.vin} />
  )
}
