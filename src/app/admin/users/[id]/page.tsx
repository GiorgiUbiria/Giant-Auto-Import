import { getUser } from "@/lib/actions/dbActions";
import { removeUser } from "@/lib/actions/authActions";
import { UserWithCarsAndSpecs } from "@/lib/interfaces";

export default async function Page({ params }: { params: { id: string } }) {
  const userToFind: UserWithCarsAndSpecs | undefined = await getUser(params.id);
  if (!userToFind) {
    return <p> No user with specified id </p>
  }

  const removeUserFromDb = removeUser.bind(null, params.id);

  return (
    <div>
      <h1>{userToFind?.user.name}</h1>
      <div>
        <h2>User Cars</h2>
        <hr />
        {userToFind?.cars?.map((car) => <p key={car.vin}>{car.vin}</p>)}
        <form action={removeUserFromDb}>
          <button type="submit">Remove</button>
        </form>
      </div>
    </div>
  );
}
