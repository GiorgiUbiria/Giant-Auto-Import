import { getUser } from "@/lib/actions/dbActions";
import { validateRequest } from "@/lib/auth";
import { UserWithCarsAndSpecs } from "@/lib/interfaces";
import { redirect } from "next/navigation";
import TableWithColumns from "./getColumns";

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
    <div className="container mx-auto px-4 py-8 text-primary">
      <h1 className="text-2xl pb-12"> Hello {userToFind?.user.name} !</h1>
      <div>
        <TableWithColumns data={userToFind.cars!} pdfToken={user.pdf_token} userId={user.id} />
      </div>
    </div>
  );
}
