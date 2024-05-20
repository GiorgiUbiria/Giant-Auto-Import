import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCars } from "./actions";
import CarsTable from "@/components/cars-table";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/login");
  }

  const cars = await getCars();

  return <CarsTable cars={cars} />;
}
