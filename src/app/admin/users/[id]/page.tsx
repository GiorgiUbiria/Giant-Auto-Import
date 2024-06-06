import { DataTable } from "@/components/data-table";
import { getUser } from "@/lib/actions/dbActions";
import { UserWithCarsAndSpecs } from "@/lib/interfaces";
import { columns } from "./columns";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { updateUser } from "@/lib/actions/authActions";
import { Form } from "@/lib/form";
import { UpdateUserForm } from "@/components/update-form";

export default async function Page({ params }: { params: { id: string } }) {
  const { user } = await validateRequest();
  if (!user || user?.role_id !== 2) {
    return redirect("/");
  }

  const userToFind: UserWithCarsAndSpecs | undefined = await getUser(params.id);
  if (!userToFind) {
    return <p> No user with specified id </p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold pb-8">{userToFind?.user.name}</h1>
      <div className="grid gap-4">
        <h2> Update the user information </h2>
        <hr />
        <Form action={updateUser}>
          <UpdateUserForm id={params.id} />
        </Form>
      </div>
      <DataTable columns={columns} data={userToFind.cars!} />
    </div>
  );
}
