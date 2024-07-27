import Link from "next/link";

import { getUserByCarId } from "@/lib/actions/userActions";
import { getUser, getUsers } from "@/lib/actions/dbActions";
import { getCarFromDatabase } from "@/lib/actions/dbActions";
import { CarData } from "@/lib/interfaces";

import EditForm from "@/components/editCar/form";
import Images from "@/components/editCar/images";
import UserCar from "@/components/editCar/user-car";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabLinks";

export default async function Page({ params }: { params: { vin: string } }) {
  const car: CarData | undefined = await getCarFromDatabase(params.vin);

  if (!car) {
    return <div>Car not found</div>;
  }

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
        <TabsList className="grid w-full grid-cols-3">
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
  )
}
