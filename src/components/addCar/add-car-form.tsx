import { validateRequest } from "@/lib/auth";
import AddForm from "./form";
import { redirect } from "next/navigation";

export default async function AddCarForm() {
  const { user } = await validateRequest();
  if (!user || user?.role_id !== 2) {
    return redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
      <h1 className="text-4xl font-bold mb-4 text-primary">Add a New Car <span>🚗</span>{" "}</h1>
      <AddForm />
    </div>
  );
}
