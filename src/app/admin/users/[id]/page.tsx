import { getUser } from "@/app/actions";
import { UserWithCar } from "@/lib/interfaces";

export default async function Page({ params }: { params: { id: string } }) {
  const user: UserWithCar | undefined = await getUser(params.id);

  return (
    <div>
      <h1>{user?.name}</h1>
      <p> {user?.vin}</p>
    </div>
  );
}
