import { CarData } from "@/lib/interfaces";
import EditForm from "./form";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function EditCarForm({ car }: { car: CarData }) {
  const { user } = await validateRequest();
  if (!user || user?.role_id !== 2) {
    return redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-bold mb-4">Edit Car with VIN {car.car.vin}</h2>
      <EditForm car={car} />
    </div>
  );
}
