import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth";
import { getCarsFromDatabaseForTables } from "@/lib/actions/dbActions";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";

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
      <DataTable columns={columns} data={cars} />
    </div>
  );
}
