import { AddCarForm } from "@/components/addCar/form";
import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const { user } = await getAuth();
  if (!user || user.role !== "ADMIN") {
    return redirect("/");
  }

  return <AddCarForm />;
}
