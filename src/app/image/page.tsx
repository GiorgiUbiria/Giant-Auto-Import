import { getCarsFromDatabase } from "@/lib/actions/dbActions";
import UploadImageForm from "./uploadImageForm";

export default async function Page() {
  const cars = await getCarsFromDatabase();
  return <UploadImageForm vins={cars.map((car) => car.car.vin!)} />;
}
