import Link from "next/link";

import { EditCarForm } from "@/components/edit-car-form";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabLinks";
import { getCarAction } from "@/lib/actions/carActions";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { vin: string } }) {
  const [data, err] = await getCarAction({ vin: params.vin });
  if (!data) {
    console.error(err);
    redirect("/admin/cars");
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-4xl font-bold mb-4 text-primary">
        Edit Car with VIN
        <Link href={`/car/${params.vin}`}>{params.vin}</Link>
      </h2>
      <Tabs defaultValue="form" searchParam="type">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="form">Form</TabsTrigger>
          {/* <TabsTrigger value="images">Images</TabsTrigger> */}
        </TabsList>
        <TabsContent value="form">
          <EditCarForm car={data} />
        </TabsContent>
        {/* <TabsContent value="images"> */}
        {/*   <Images images={car.images} vin={car.car.vin!} /> */}
        {/* </TabsContent> */}
      </Tabs>
    </div>
  )
}
