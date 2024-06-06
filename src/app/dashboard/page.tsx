import { UserCarsTable } from "@/components/user-cars-table";
import { getUser } from "@/lib/actions/dbActions";
import { validateRequest } from "@/lib/auth";
import { UserWithCarsAndSpecs } from "@/lib/interfaces";
import { redirect } from "next/navigation";
import { columns } from "./columns";

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/");
  }
  const userToFind: UserWithCarsAndSpecs | undefined = await getUser(user.id);
  if (!userToFind) {
    return <p> No user with specified id </p>;
  }

  return (
    <div>
      <h1>{userToFind?.user.name}</h1>
      <div>
        <h2>User Cars</h2>
        <hr />
        <UserCarsTable columns={columns} data={userToFind?.cars!} />
      </div>
    </div>
  );
}
