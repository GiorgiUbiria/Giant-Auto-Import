import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { fetchCars, getCars, updateCarsFromAPI } from "../actions";

import CarsTable from "@/components/cars-table";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user || user?.role_id !== 2) {
    return redirect("/");
  }

  const cars = await fetchCars();

  await updateCarsFromAPI();

  return <CarsTable cars={cars} pdfToken={user.pdf_token} />;
}

