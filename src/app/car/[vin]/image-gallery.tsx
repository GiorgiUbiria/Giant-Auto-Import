"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DownloadButton from "./download-button";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { getImagesAction } from "@/lib/actions/imageActions";
import { FeaturedImages } from "./featured-images";

export const ImageGallery = ({ vin }: { vin: string }) => {
  const imageTypes = ["AUCTION", "PICK_UP", "WAREHOUSE", "DELIVERY"];
  const { data } = useServerActionQuery(getImagesAction, {
    input: {
      vin: vin,
    },
    queryKey: ["getImagesForCar", vin],
  })

  if (!data) {
    return (
      <div>
        No Images.
      </div>
    )
  }

  const filterImagesByType = (images: typeof data, imageType: string) =>
    images.filter((image) => image.imageType === imageType);

  return (
    <div className="grid place-items-center">
      <Tabs defaultValue="AUCTION" className="w-full text-black dark:text-white gap-2">
        <TabsList className="grid w-full grid-cols-4 bg-gray-300 dark:bg-gray-700 dark:text-white mb-10">
          {imageTypes.map((type) => (
            <TabsTrigger key={type} value={type}>
              {type}
            </TabsTrigger>
          ))}
        </TabsList>
        {imageTypes.map((type) => (
          <TabsContent key={type} value={type}>
            <FeaturedImages data={filterImagesByType(data, type)} />
          </TabsContent>
        ))}
      </Tabs>
      <DownloadButton content={data} vin={vin} />
    </div>
  );
}
