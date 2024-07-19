import { redirect } from "next/navigation";

import { validateRequest } from "@/lib/auth";
import { getCarsFromDatabaseForTables } from "@/lib/actions/dbActions";
import { syncCarImagesWithDatabase } from "@/lib/actions/bucketActions";

import { columns } from "./columns";

import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user || user?.role_id !== 2) {
    return redirect("/");
  }

  const cars = await getCarsFromDatabaseForTables();

  if (!cars) {
    return <p> No cars fetched. </p>;
  }

  return (
    <div className="container mx-auto py-10 text-primary">
      <form action={syncCarImagesWithDatabase}>
        <Button type="submit"> Sync Images </Button>
      </form>
      <DataTable columns={columns} data={cars} />
    </div>
  );
}
