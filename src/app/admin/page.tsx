import { redirect } from "next/navigation";

import { validateRequest } from "@/lib/auth";
import { updateLocalDatabaseFromAPI } from "@/lib/actions/actions";
import { getCarsFromDatabase } from "@/lib/actions/dbActions";

import { columns } from "./columns";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user || user?.role_id !== 2) {
    return redirect("/");
  }


  const cars = await getCarsFromDatabase();

  return (
    <div className="container-fluid mx-auto py-10">
      <form action={updateLocalDatabaseFromAPI} className="pb-12">
        <Button type="submit"> Update database </Button>
      </form>
      <DataTable columns={columns} data={cars} />
    </div>
  );
}
