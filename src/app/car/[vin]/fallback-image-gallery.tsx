"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { imageCacheService } from "@/lib/image-cache";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useMedia } from "react-use";

// Import lightbox and plugins synchronously
import Lightbox from "yet-another-react-lightbox";
import Download from "yet-another-react-lightbox/plugins/download";
import Inline from "yet-another-react-lightbox/plugins/inline";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/styles.css";

const DownloadButton = dynamic(() => import("./download-button"), {
  loading: () => (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  ),
  ssr: false,
});

const NextJsImage = dynamic(() => import("./nextjs-image"), {
  loading: () => (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  ),
  ssr: false,
});

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
  imageType: "WAREHOUSE" | "PICK_UP" | "DELIVERY" | "AUCTION";
  url: string;
  priority: boolean | null;
};

export const FallbackImageGallery = ({
  vin,
  fetchByType = false,
}: {
  vin: string;
  fetchByType?: boolean;
}) => {
  const imageTypes = ["AUCTION", "PICK_UP", "WAREHOUSE", "DELIVERY"];
  const [data, setData] = useState<ImageData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [startIndex, setStartIndex] = useState<number>(0);
  const [selectedType, setSelectedType] = useState<string>(imageTypes[0]);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const isMobile = useMedia("(max-width: 640px)", false);

  // Define all hooks before any early returns
  const handleImageLoad = useCallback((imageKey: string) => {
    setLoadedImages((prev) => new Set(prev).add(imageKey));
  }, []);

  const filterImagesByType = useCallback(
    (images: ImageData[], imageType: string) =>
      images.filter((image) => image.imageType === imageType),
    []
  );

  const getSlides = useCallback((filteredData: ImageData[]) => {
    return filteredData.map(({ imageKey, url }) => {
      return {
        src: url, // Use direct URL for better loading
        width: 1920,
        height: 1080,
        downloadUrl: url,
      };
    });
  }, []);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await imageCacheService.getImageList({
          vin,
          type: fetchByType ? selectedType : undefined,
          pageSize: 0, // Get all images
          revalidate: 60 * 1000, // 1 minute cache for public gallery
        });

        setData(result.images || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages();
  }, [vin, fetchByType, selectedType]);

  // Preload images for better UX
  useEffect(() => {
    if (data && data.length > 0) {
      const currentTypeImages = fetchByType
        ? data.filter((img) => img.imageType === selectedType)
        : data;

      // Preload first few images
      const imagesToPreload = currentTypeImages.slice(0, 3);
      imagesToPreload.forEach((img) => {
        const image = new Image();
        image.onload = () => handleImageLoad(img.imageKey);
        image.onerror = () => console.warn(`Failed to preload image: ${img.imageKey}`);
        image.src = img.url;
      });
    }
  }, [data, selectedType, fetchByType, handleImageLoad]);

  // Early returns after all hooks
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (!data || data.length === 0) return <EmptyState />;

  return (
    <div className="grid place-items-center w-full">
      <Tabs
        value={selectedType}
        onValueChange={setSelectedType}
        className="w-full text-black dark:text-white gap-2"
      >
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 bg-gray-300 dark:bg-gray-700 dark:text-white mb-4 sm:mb-10">
          {imageTypes.map((type) => (
            <TabsTrigger key={type} value={type} className="text-sm sm:text-base py-2 sm:py-1">
              {type}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-32 sm:mt-0">
          {imageTypes.map((type) => {
            let filteredData = data;
            if (!fetchByType) {
              filteredData = filterImagesByType(data, type);
            } else if (type !== selectedType) {
              filteredData = [];
            }
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
                        },
                      }}
                      plugins={[Inline, ...(isMobile ? [] : [Thumbnails])]}
                      carousel={{ imageFit: "contain" }}
                      on={{
                        click: ({ index }) => {
                          setStartIndex(index);
                          setOpen(true);
                        },
                      }}
                      thumbnails={
                        isMobile
                          ? undefined
                          : {
                              width: 60,
                              height: 40,
                              border: 1,
                              borderRadius: 4,
                              padding: 4,
                              gap: 8,
                            }
                      }
                    />
                  </Suspense>
                </div>
              </TabsContent>
            );
          })}
        </div>
      </Tabs>
      {open &&
        (() => {
          // Only show images for the current tab/type in the modal
          let filteredData = data;
          if (!fetchByType) {
            filteredData = filterImagesByType(data, selectedType);
          }
          const slides = getSlides(filteredData);
          return (
            <Lightbox
              open={open}
              close={() => setOpen(false)}
              slides={slides}
              index={startIndex}
              plugins={[...(isMobile ? [] : [Thumbnails]), Download]}
            />
          );
        })()}
      <DownloadButton content={data} vin={vin} />
    </div>
  );
};
