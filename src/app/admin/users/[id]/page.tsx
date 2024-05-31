import { getUser } from "@/lib/actions/dbActions";
import { UserWithCar } from "@/lib/interfaces";

export default async function Page({ params }: { params: { id: string } }) {
  const user: UserWithCar | undefined = await getUser(params.id);

  return (
    <div>
      <h1>{user?.name}</h1>
      <div>
        <h2>User Cars</h2>
        <hr />
        {user?.cars?.map((car) => <p key={car.vin}>{car.vin}</p>)}
      </div>
    </div>
  );
}
