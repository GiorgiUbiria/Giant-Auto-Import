import EditCarForm from "@/components/editCar/edit-car-form";
import { getCarFromDatabase } from "@/lib/actions/dbActions";
import { CarData } from "@/lib/interfaces";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getImagesFromBucket } from "@/lib/actions/bucketActions";

export default async function Page({ params }: { params: { vin: string } }) {
  const { user } = await validateRequest();
  if (!user || user?.role_id !== 2) {
    return redirect("/");
  }

  const car: CarData | undefined = await getCarFromDatabase(params.vin);

  if (!car) {
    return <div>Car not found</div>;
  }

  const containerImages = await getImagesFromBucket(params.vin);

  car.images = [...car.images!, ...containerImages];

  return <EditCarForm car={car!} />;
}
