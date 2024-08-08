import { DataTable } from "@/components/data-table";
import { getAuth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { columns } from "./columns";
import { getUsersAction } from "@/lib/actions/userActions";

export default async function Page() {
  const { user } = await getAuth();
  if (!user || user.role !== "ADMIN") {
    return redirect("/");
  }

  const [users, err] = await getUsersAction();
  if (err) {
    console.error(err);
  }
  
  return (
    <div className="container mx-auto py-10 text-primary">
      <h1 className="text-3xl font-bold pb-8">Users</h1>
      {users !== null && users.length > 0 ? (
        <DataTable columns={columns} data={users} />
      ) : (
        <>
          <p> No users found </p>
          <Link href="/admin/signup">Add User</Link>
        </>
      )}
    </div>
  );
}
