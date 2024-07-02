import { CarData, Image as ImageType } from "@/lib/interfaces";
import EditForm from "./form";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Images from "./images";
import Transactions from "./transactions";
import { getUserByCarId } from "@/lib/actions/userActions";
import Notes from "./notes";
import { getUser, getUsers } from "@/lib/actions/dbActions";
import UserCar from "./user-car";

export default async function EditCarForm({ car }: { car: CarData }) {
  const { user } = await validateRequest();
  if (!user || user?.role_id !== 2) {
    return redirect("/");
  } 

  const res  = await getUserByCarId(car.car.id);

  const users = await getUsers();

  const carUser = await getUser(res.data?.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-bold mb-4">
        Edit Car with VIN {car.car.vin}
      </h2>
      <Tabs defaultValue="form">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="user">User</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="form">
          <EditForm car={car} />
        </TabsContent>
        <TabsContent value="images">
          {car.images && car.images.length > 0 && car.car.vin ? (
            <Images images={car.images} vin={car.car.vin} />
          ) : (
            <p>No images</p>
          )}
        </TabsContent>
        <TabsContent value="user">
          <UserCar car={car} userId={res.data?.id} users={users} carUser={carUser} />
        </TabsContent>
        <TabsContent value="transactions">
          <Transactions car={car} userId={res.data?.id} />
        </TabsContent>
        <TabsContent value="notes">
          <Notes car={car} userId={res.data?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
