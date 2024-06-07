import { redirect } from "next/navigation";

import { validateRequest } from "@/lib/auth";
import { updateLocalDatabaseImages } from "@/lib/actions/imageActions";
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

  if (!cars) {
    return <p> No cars fetched. </p>
  }

  return (
    <div className="container-fluid mx-auto py-10">
      <form action={updateLocalDatabaseImages} className="pb-12">
        <Button type="submit"> Update database </Button>
      </form>
      
      <form action={updateLocalDatabaseImages} className="pb-12">
        <Button type="submit"> Fetch Images </Button>
      </form>
      <DataTable columns={columns} data={cars} />
    </div>
  );
}
