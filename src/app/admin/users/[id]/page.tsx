import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { Client } from "./client";

export default async function Page({ params }: { params: { id: string } }) {
  const { user } = await getAuth();
  if (!user || user.role !== "ADMIN") {
    return redirect("/");
  }

  return (
    <Client id={params.id} />
  );
}
