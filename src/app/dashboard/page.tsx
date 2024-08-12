import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Client } from "./client";

export default async function Page() {
  const { user } = await getAuth();
  if (!user) {
    return redirect("/");
  }

  return (
    <Client userId={user.id} />
  );
}
