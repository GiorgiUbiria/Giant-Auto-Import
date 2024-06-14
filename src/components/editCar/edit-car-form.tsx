import { CarData } from "@/lib/interfaces";
import EditForm from "./form";

export default async function EditCarForm({ car }: { car: CarData }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-bold mb-4">Edit Car with VIN {car.car.vin}</h2>
      <EditForm car={car} />
    </div>
  );
}
