import { getUser } from "@/lib/actions/dbActions";
import { UserWithCarsAndSpecs } from "@/lib/interfaces";

export default async function Page({ params }: { params: { id: string } }) {
  const user: UserWithCarsAndSpecs | undefined = await getUser(params.id);

  return (
    <div>
      <h1>{user?.user.name}</h1>
      <div>
        <h2>User Cars</h2>
        <hr />
        {user?.cars?.map((car) => <p key={car.vin}>{car.vin}</p>)}
      </div>
    </div>
  );
}
