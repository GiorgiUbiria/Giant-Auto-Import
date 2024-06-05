import { getUser } from "@/lib/actions/dbActions";
import { UserWithCarsAndSpecs } from "@/lib/interfaces";

export default async function Page({ params }: { params: { id: string } }) {
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
        {userToFind?.cars?.map((data) => <p key={data.car.vin}>{data.car.vin}</p>)}
      </div>
    </div>
  );
}
