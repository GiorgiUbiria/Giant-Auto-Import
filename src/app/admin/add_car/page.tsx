import { AddCarForm } from "@/components/add-car-form";
import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const { user } = await getAuth();
  if (!user || user.role !== "ADMIN") {
    return redirect("/");
  }

  return (
    <div className="w-full grid place-items-center">
      <AddCarForm />
    </div>
  )
}
