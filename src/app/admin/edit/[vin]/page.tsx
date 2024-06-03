import EditCarForm from "@/components/edit-car-form";
import { getCarFromDatabase } from "@/lib/actions/dbActions";
import { CarData } from "@/lib/interfaces";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { vin: string } }) {
  const { user } = await validateRequest();
  if (!user || user?.role_id !== 2) {
    return redirect("/");
  }
  const car: CarData | undefined = await getCarFromDatabase(params.vin);
  return <EditCarForm car={car!} />;
}
