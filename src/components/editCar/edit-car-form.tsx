import { CarData, Image as ImageType } from "@/lib/interfaces";
import EditForm from "./form";
import { validateRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Images from "./images";
import Transactions from "./transactions";
import { getUserByCarId } from "@/lib/actions/userActions";
import Notes from "./notes";

export default async function EditCarForm({ car }: { car: CarData }) {
  const { user } = await validateRequest();
  if (!user || user?.role_id !== 2) {
    return redirect("/");
  } 

  const res  = await getUserByCarId(car.car.id);
  let carUser = null;
  if (res.data) {
    carUser = res.data;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-bold mb-4">
        Edit Car with VIN {car.car.vin}
      </h2>
      <Tabs defaultValue="form">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
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
        <TabsContent value="transactions">
          <Transactions car={car} userId={carUser?.id} />
        </TabsContent>
        <TabsContent value="notes">
          <Notes carId={car.car.id} userId={carUser?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
