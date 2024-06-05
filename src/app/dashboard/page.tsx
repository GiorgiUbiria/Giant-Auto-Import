import { getUser } from "@/lib/actions/dbActions";
import { validateRequest } from "@/lib/auth";
import { UserWithCarsAndSpecs } from "@/lib/interfaces";
import { redirect } from "next/navigation";

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
        {userToFind?.cars?.map((data) => (
          <p key={data.car.vin}>{data.car.vin}</p>
        ))}
      </div>
    </div>
  );
}
