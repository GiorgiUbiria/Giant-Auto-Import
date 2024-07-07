import { validateRequest } from "@/lib/auth";
import AddForm from "./form";
import { redirect } from "next/navigation";

export default async function AddCarForm() {
  const { user } = await validateRequest();
  if (!user || user?.role_id !== 2) {
    return redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Add New Car <span>🚗</span>{" "}<span className="text-xs text-muted-foreground">(* required)</span></h1>
      <AddForm />
    </div>
  );
}
