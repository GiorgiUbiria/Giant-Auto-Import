import { redirect } from "next/navigation";

import { validateRequest } from "@/lib/auth";
import {  updateLocalDatabaseFromAPI } from "@/lib/actions/actions";
import { getCarsFromDatabase} from "@/lib/actions/dbActions";

import CarsTable from "@/components/cars-table";
import { Button } from "@/components/ui/button";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user || user?.role_id !== 2) {
    return redirect("/");
  }

  const cars = await getCarsFromDatabase();

  return (
    <div className="pt-12">
      <form action={updateLocalDatabaseFromAPI} className="pb-12">
        <Button type="submit"> Update database </Button>
      </form>
      <CarsTable cars={cars} pdfToken={user.pdf_token} />
    </div>
  );
}
