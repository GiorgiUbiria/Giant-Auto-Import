import { getUsers } from "@/lib/actions/dbActions";
import { User } from "@/lib/interfaces";
import { UserDataTable } from "@/components/user-data-table";
import { columns } from "./columns";

export default async function Page() {
  const users: User[] | undefined = await getUsers();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold pb-8">Users</h1>
      <UserDataTable columns={columns} data={users!} />
    </div>
  );
}
