"use client";

import { FeaturedImageGallery } from "@/components/image-gallery";
import { CarData } from "@/lib/interfaces";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Gallery({ car }: { car: CarData }) {
  return (
    <div className="lg:w-1/2 grid place-items-center">
      <Tabs defaultValue="Arrival" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="Arrival">Arrival</TabsTrigger>
          <TabsTrigger value="Departure" >Departure</TabsTrigger>
        </TabsList>
        <TabsContent value="Arrival" className="w-full">
          <FeaturedImageGallery data={car.images !== undefined && car.images.length > 0 && car.images.some((image) => image.imageType === "Arrival") ? car.images.filter((image) => image.imageType === "Arrival") : []} />
        </TabsContent>
        <TabsContent value="Departure" className="w-full">
          <FeaturedImageGallery data={car.images !== undefined && car.images.length > 0 && car.images.some((image) => image.imageType === "Container") ? car.images.filter((image) => image.imageType === "Container") : []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
