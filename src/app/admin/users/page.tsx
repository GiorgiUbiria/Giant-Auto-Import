import { getUsers } from "@/lib/actions/dbActions";
import { DatabaseUser } from "@/lib/db";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

export default async function Page() {
  const users: DatabaseUser[] | undefined = await getUsers();

  return (
   <div className="container mx-auto py-10">
      <DataTable columns={columns} data={users!} />
    </div>
  );
}
