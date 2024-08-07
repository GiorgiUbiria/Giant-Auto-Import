import { DataTable } from "@/components/data-table";
import { getCarsAction } from "@/lib/actions/carActions";
import { getAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { columns } from "./columns";

export default async function Page() {
  const { user } = await getAuth();
  if (!user || user.role !== "ADMIN") {
    return redirect("/");
  }

  const [cars] = await getCarsAction();

  return (
    <div className="py-10 text-primary">
      <DataTable columns={columns} data={cars} />
    </div>
  );
}
