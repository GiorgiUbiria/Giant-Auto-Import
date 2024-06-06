import { DataTable } from "@/components/data-table";
import { getUser } from "@/lib/actions/dbActions";
import { UserWithCarsAndSpecs } from "@/lib/interfaces";
import { columns } from "./columns";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user || user?.role_id !== 2) {
    return redirect("/");
  }
  
  const userToFind: UserWithCarsAndSpecs | undefined = await getUser(params.id);
  if (!userToFind) {
    return <p> No user with specified id </p>
  }

  return (
    <div>
      <h1>{userToFind?.user.name}</h1>
      <div>
        <h2>User Cars</h2>
        <hr />
        <DataTable columns={columns} data={userToFind.cars!} />
      </div>
    </div>
  );
}
