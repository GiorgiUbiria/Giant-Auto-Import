import { redirect } from "next/navigation";

import { validateRequest } from "@/lib/auth";
import { fetchCars, updateLocalDatabaseFromAPI } from "@/lib/actions/actions";
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
    return <p> No cars fetched. </p>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto flex gap-4 py-8">
        <form action={updateLocalDatabaseFromAPI}>
          <Button type="submit" disabled> Update database </Button>
        </form>
        <form action={updateLocalDatabaseImages}>
          <Button type="submit" disabled> Fetch Images </Button>
        </form>
      </div>
      <DataTable columns={columns} data={cars} />
    </div>
  );
}
