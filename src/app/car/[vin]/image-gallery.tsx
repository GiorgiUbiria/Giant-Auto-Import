"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getImageKeys } from "@/lib/actions/imageActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Download from "yet-another-react-lightbox/plugins/download";
import Inline from "yet-another-react-lightbox/plugins/inline";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/styles.css";
import DownloadButton from "./download-button";
import NextJsImage from "./nextjs-image";

const breakpoints = [3840, 1920, 1080, 640, 384, 256, 128];

export const ImageGallery = ({ vin }: { vin: string }) => {
  const imageTypes = ["AUCTION", "PICK_UP", "WAREHOUSE", "DELIVERY"];
  const publicUrl = process.env.NEXT_PUBLIC_BUCKET_URL;
  const { data, error, isLoading } = useServerActionQuery(getImageKeys, {
    input: { vin },
    queryKey: ["getImagesForCar", vin],
  });
  const [open, setOpen] = useState<boolean>(false);
  const [startIndex, setStartIndex] = useState<number>(0);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading images: {error.message}</div>;
  if (!data || data.length === 0) return <div>No images available.</div>;
  if (!publicUrl) return <div>Error: Public URL not configured.</div>;

  const filterImagesByType = (images: typeof data, imageType: string) =>
    images.filter((image) => image.imageType === imageType);

  const getSlides = (filteredData: typeof data) =>
    filteredData.map(({ imageKey }) => ({
      src: `${publicUrl}/${imageKey}`,
      width: 3840,
      height: 2560,
      srcSet: breakpoints.map((breakpoint) => ({
        src: `${publicUrl}/${imageKey}`,
        width: breakpoint,
        height: Math.round((2560 / 3840) * breakpoint),
      })),
      downloadUrl: `${publicUrl}/${imageKey}`,
    }));

  return (
    <div className="grid place-items-center">
      <Tabs defaultValue={imageTypes[0]} className="w-full text-black dark:text-white gap-2">
        <TabsList className="grid w-full grid-cols-4 bg-gray-300 dark:bg-gray-700 dark:text-white mb-10">
          {imageTypes.map((type) => (
            <TabsTrigger key={type} value={type}>
              {type}
            </TabsTrigger>
          ))}
        </TabsList>

        {imageTypes.map((type) => {
          const filteredData = filterImagesByType(data, type);
          const slides = getSlides(filteredData);

          if (slides.length === 0) {
            return (
              <TabsContent key={type} value={type}>
                <div>No images available for {type}</div>
              </TabsContent>
            );
          }

          return (
            <TabsContent key={type} value={type}>
              <div style={{ width: "100%", maxWidth: "900px", aspectRatio: "3 / 2" }}>
                <Lightbox
                  slides={slides}
                  inline={{ style: { width: "100%", maxWidth: "900px", aspectRatio: "3 / 2" } }}
                  plugins={[Inline, Thumbnails]}
                  carousel={{ imageFit: "cover" }}
                  render={{ slide: NextJsImage, thumbnail: NextJsImage }}
                  on={{
                    click: ({ index }) => {
                      setStartIndex(index);
                      setOpen(true);
                    },
                  }}
                />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
      {open && (
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          slides={getSlides(data)}
          index={startIndex}
          render={{ slide: NextJsImage, thumbnail: NextJsImage }}
          plugins={[Thumbnails, Download]}
        />
      )}
      <DownloadButton content={data} vin={vin} />
    </div>
  );
};