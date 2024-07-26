import dynamic from 'next/dynamic';
import { Image } from "@/lib/interfaces";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DownloadButton from "./download-button";

const FeaturedImageGallery = dynamic(() => import('@/components/gallery/image-gallery'));

export default function Gallery({
  images,
  vin,
}: {
  images: Image[];
  vin: string;
}) {
  const imageTypes = ["AUCTION", "PICK_UP", "WAREHOUSE", "DELIVERY"];

  const filterImagesByType = (images: Image[], imageType: string) =>
    images.filter((image) => image.imageType === imageType);

  return (
    <div className="grid place-items-center">
      <Tabs defaultValue="AUCTION" className="w-full text-black dark:text-white">
        <TabsList className="grid w-full grid-cols-4 bg-gray-300 dark:bg-gray-700 dark:text-white">
          {imageTypes.map((type) => (
            <TabsTrigger key={type} value={type}>
              {type}
            </TabsTrigger>
          ))}
        </TabsList>
        {imageTypes.map((type) => (
          <TabsContent key={type} value={type}>
            <FeaturedImageGallery data={filterImagesByType(images, type)} />
          </TabsContent>
        ))}
      </Tabs>
      <DownloadButton content={images} vin={vin} />
    </div>
  );
}
