import { getUsers } from "@/lib/actions/dbActions";
import { DatabaseUser } from "@/lib/db";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

export default async function Page() {
  const users: DatabaseUser[] | undefined = await getUsers();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold pb-8">Users</h1>
      <DataTable columns={columns} data={users!} />
    </div>
  );
}
