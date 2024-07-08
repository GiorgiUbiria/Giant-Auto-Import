import { DbUser, getUsers } from "@/lib/actions/dbActions";
import { UserDataTable } from "@/components/user-data-table";
import { columns } from "./columns";
import { redirect } from "next/navigation";
import { validateRequest } from "@/lib/auth";
import Link from "next/link";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user || (user && user.role_id !== 2)) {
    return redirect("/");
  }

  const users: DbUser[] | undefined = await getUsers();

  return (
    <div className="container mx-auto py-10 text-primary">
      <h1 className="text-3xl font-bold pb-8">Users</h1>
      {users !== undefined && users.length > 0 ? (
        <UserDataTable columns={columns} data={users!} />
      ) : (
        <>
          <p> No users found </p>
          <Link href="/admin/signup">Add User</Link>
        </>
      )}
    </div>
  );
}
