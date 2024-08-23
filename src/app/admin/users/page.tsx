import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Client } from "./client";

export default async function Page() {
  const { user } = await getAuth();
  if (!user || user.role !== "ADMIN") {
    return redirect("/");
  }

  return (
    <Client />
  );
}
