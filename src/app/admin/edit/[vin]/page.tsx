import EditCarForm from "@/components/edit-car-form";
import { getCarFromDatabase } from "@/lib/actions/dbActions";
import { DbCar } from "@/lib/interfaces";

export default async function Page({ params }: { params: { vin: string } }) {
  const car: DbCar | undefined = await getCarFromDatabase(params.vin);
  return <EditCarForm car={car!} />;
}
