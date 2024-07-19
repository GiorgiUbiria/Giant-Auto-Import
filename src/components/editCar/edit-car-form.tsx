import { CarData } from "@/lib/interfaces";
import EditForm from "./form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabLinks";
import Images from "./images";
import { getUserByCarId } from "@/lib/actions/userActions";
import { getUser, getUsers } from "@/lib/actions/dbActions";
import UserCar from "./user-car";
import Link from "next/link";

export default async function EditCarForm({ car }: { car: CarData }) {
  const res = await getUserByCarId(car.car.id);

  const users = await getUsers();

  const carUser = await getUser(res.data?.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-4xl font-bold mb-4 text-primary">
        Edit Car with VIN{" "}
        <Link href={`/car/${car.car.vin}`}>{car.car.vin}</Link>
      </h2>
      <Tabs defaultValue="form" searchParam="type">
        <TabsList className="grid w-full grid-cols-3 text-primary">
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="user">User</TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          <EditForm car={car} />
        </TabsContent>
        <TabsContent value="images">
          <Images images={car.images} vin={car.car.vin!} />
        </TabsContent>
        <TabsContent value="user">
          <UserCar
            car={car}
            userId={res.data?.id}
            users={users}
            carUser={carUser}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
