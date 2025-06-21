"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import Lightbox from "yet-another-react-lightbox";
import Download from "yet-another-react-lightbox/plugins/download";
import Inline from "yet-another-react-lightbox/plugins/inline";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/styles.css";
import DownloadButton from "./download-button";
import NextJsImage from "./nextjs-image";
import { useMedia } from "react-use";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";

const breakpoints = [3840, 1920, 1080, 640, 384, 256, 128];

const LoadingState = () => (
  <div className="w-full h-[50vh] grid place-items-center">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading images...</p>
    </div>
  </div>
);

const ErrorState = () => (
  <div className="w-full h-[50vh] grid place-items-center">
    <p className="text-red-500">Error loading images. Please try again later.</p>
  </div>
);

const EmptyState = () => (
  <div className="w-full h-[50vh] grid place-items-center">
    <p className="text-muted-foreground">No images available.</p>
  </div>
);

type ImageData = {
  imageKey: string;
  imageType: "WAREHOUSE" | "PICK_UP" | "DELIVERED" | "AUCTION";
};

export const FallbackImageGallery = ({ vin }: { vin: string }) => {
  const imageTypes = ["AUCTION", "PICK_UP", "WAREHOUSE", "DELIVERED"];
  const publicUrl = process.env.NEXT_PUBLIC_BUCKET_URL;
  const [data, setData] = useState<ImageData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [startIndex, setStartIndex] = useState<number>(0);
  const isMobile = useMedia('(max-width: 640px)', false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        console.log("FallbackImageGallery: Fetching images for VIN", vin);
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/test-images?vin=${encodeURIComponent(vin)}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch images');
        }

        console.log("FallbackImageGallery: Images fetched successfully", { count: result.count });
        setData(result.images || []);
      } catch (err) {
        console.error("FallbackImageGallery: Error fetching images", err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [vin]);

  console.log("FallbackImageGallery: Render state", { 
    vin, 
    isLoading, 
    hasError: !!error, 
    dataLength: data?.length || 0,
    publicUrl: !!publicUrl 
  });

  if (isLoading) return <LoadingState />;
  if (error) {
    console.error("FallbackImageGallery: Error state", error);
    return <ErrorState />;
  }
  if (!data || data.length === 0) {
    console.log("FallbackImageGallery: No data available for VIN", vin);
    return <EmptyState />;
  }
  if (!publicUrl) {
    console.error("FallbackImageGallery: Public URL not configured");
    return <div>Error: Public URL not configured.</div>;
  }

  const filterImagesByType = (images: ImageData[], imageType: string) =>
    images.filter((image) => image.imageType === imageType);

  const getSlides = (filteredData: ImageData[]) =>
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
    <div className="grid place-items-center w-full">
      <Tabs defaultValue={imageTypes[0]} className="w-full text-black dark:text-white gap-2">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 bg-gray-300 dark:bg-gray-700 dark:text-white mb-4 sm:mb-10">
          {imageTypes.map((type) => (
            <TabsTrigger key={type} value={type} className="text-sm sm:text-base py-2 sm:py-1">
              {type}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-32 sm:mt-0">
          {imageTypes.map((type) => {
            const filteredData = filterImagesByType(data, type);
            const slides = getSlides(filteredData);

            if (slides.length === 0) {
              return (
                <TabsContent key={type} value={type} className="text-center p-4">
                  <div className="text-sm sm:text-base">No images available for {type}</div>
                </TabsContent>
              );
            }

            return (
              <TabsContent key={type} value={type} className="w-full">
                <div className="w-full aspect-[3/2] max-w-full overflow-hidden">
                  <Suspense fallback={<LoadingState />}>
                    <Lightbox
                      slides={slides}
                      inline={{
                        style: {
                          aspectRatio: "3/2",
                          maxHeight: "100%",
                          width: "100%",
                        }
                      }}
                      plugins={[Inline, ...(isMobile ? [] : [Thumbnails])]}
                      carousel={{ imageFit: "contain" }}
                      render={{ slide: NextJsImage, thumbnail: NextJsImage }}
                      on={{
                        click: ({ index }) => {
                          setStartIndex(index);
                          setOpen(true);
                        },
                      }}
                      thumbnails={isMobile ? undefined : {
                        width: 60,
                        height: 40,
                        border: 1,
                        borderRadius: 4,
                        padding: 4,
                        gap: 8,
                      }}
                    />
                  </Suspense>
                </div>
              </TabsContent>
            );
          })}
        </div>
      </Tabs>
      {open && (
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          slides={getSlides(data)}
          index={startIndex}
          render={{ slide: NextJsImage, thumbnail: NextJsImage }}
          plugins={[...(isMobile ? [] : [Thumbnails]), Download]}
        />
      )}
      <DownloadButton content={data} vin={vin} />
    </div>
  );
}; 