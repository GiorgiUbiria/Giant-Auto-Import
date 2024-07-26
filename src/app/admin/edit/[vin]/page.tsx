import EditCarForm from "@/components/editCar/edit-car-form";
import { getCarFromDatabase } from "@/lib/actions/dbActions";
import { CarData } from "@/lib/interfaces";

export default async function Page({ params }: { params: { vin: string } }) {
  const car: CarData | undefined = await getCarFromDatabase(params.vin);

  if (!car) {
    return <div>Car not found</div>;
  }

  return <EditCarForm car={car!} />;
}
