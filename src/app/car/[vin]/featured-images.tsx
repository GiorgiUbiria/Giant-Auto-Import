import { FeaturedImageGallery } from "@/components/gallery/image-gallery";
import { CarData } from "@/lib/interfaces";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DownloadButton from "./download-button";

export default function Gallery({ car }: { car: CarData }) {
  return (
    <div className="grid place-items-center">
      <Tabs defaultValue="AUCTION" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="AUCTION">Auction</TabsTrigger>
          <TabsTrigger value="PICK_UP">Pick Up</TabsTrigger>
          <TabsTrigger value="WAREHOUSE">Warehouse</TabsTrigger>
          <TabsTrigger value="DELIVERY">Delivery</TabsTrigger>
        </TabsList>
        <TabsContent value="AUCTION">
          <FeaturedImageGallery
            data={
              car.images !== undefined &&
              car.images.length > 0 &&
              car.images.some((image) => image.imageType === "AUCTION")
                ? car.images.filter((image) => image.imageType === "AUCTION")
                : []
            }
          />
        </TabsContent>
        <TabsContent value="DELIVERY">
          <FeaturedImageGallery
            data={
              car.images !== undefined &&
              car.images.length > 0 &&
              car.images.some((image) => image.imageType === "DELIVERY")
                ? car.images.filter((image) => image.imageType === "DELIVERY")
                : []
            }
          />
        </TabsContent>
        <TabsContent value="WAREHOUSE">
          <FeaturedImageGallery
            data={
              car.images !== undefined &&
              car.images.length > 0 &&
              car.images.some((image) => image.imageType === "WAREHOUSE")
                ? car.images.filter((image) => image.imageType === "WAREHOUSE")
                : []
            }
          />
        </TabsContent>
        <TabsContent value="PICK_UP">
          <FeaturedImageGallery
            data={
              car.images !== undefined &&
              car.images.length > 0 &&
              car.images.some((image) => image.imageType === "PICK_UP")
                ? car.images.filter((image) => image.imageType === "PICK_UP")
                : []
            }
          />
        </TabsContent>
      </Tabs>
      <DownloadButton content={car.images} vin={car.car.vin!} />
    </div>
  );
}
