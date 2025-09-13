"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { imageCacheService } from "@/lib/services/imageCache";
import { isThumbnailKey } from "@/lib/utils/thumbnailGenerator";
import { Loader2 } from "lucide-react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { preconnect, preload } from "react-dom";
import { useMedia } from "react-use";
import Lightbox from "yet-another-react-lightbox";
import Download from "yet-another-react-lightbox/plugins/download";
import Inline from "yet-another-react-lightbox/plugins/inline";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/styles.css";
import DownloadButton from "./download-button";
import NextJsImage from "./nextjs-image";

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

export const ImageGallery = ({ vin }: { vin: string }) => {
  const imageTypes = ["AUCTION", "PICK_UP", "WAREHOUSE", "DELIVERY"];
  const publicUrl = process.env.NEXT_PUBLIC_BUCKET_URL;
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState<boolean>(false);
  const [startIndex, setStartIndex] = useState<number>(0);
  const [selectedType, setSelectedType] = useState<string>(imageTypes[0]);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const isMobile = useMedia("(max-width: 640px)", false);

  // Fetch images using cache service
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await imageCacheService.getImageList({
          vin,
          revalidate: 2 * 60 * 1000, // 2 minutes cache for public gallery
        });

        setData(result.images || []);
      } catch (err) {
        console.error("Error fetching images:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch images"));
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, [vin]);

  // Preconnect to CDN for better performance
  useEffect(() => {
    if (publicUrl) {
      preconnect(publicUrl);
    }
  }, [publicUrl]);

  // Filter out thumbnails and organize images
  const allImages = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    // Filter out thumbnails and previews, keep only original images
    return list.filter(
      (img) => !isThumbnailKey(img.imageKey) && !img.imageKey.includes("/preview_")
    );
  }, [data]);

  // Preload first few images for better perceived performance
  useEffect(() => {
    if (allImages && allImages.length > 0 && publicUrl) {
      const currentTypeImages = allImages.filter((img) => img.imageType === selectedType);
      const imagesToPreload = currentTypeImages.slice(0, 3);
      imagesToPreload.forEach((img) => {
        preload(`${publicUrl}/${img.imageKey}`, { as: "image" });
      });
    }
  }, [allImages, selectedType, publicUrl]);

  const handleImageLoad = useCallback((imageKey: string) => {
    setLoadedImages((prev) => new Set(prev).add(imageKey));
  }, []);

  console.log("ImageGallery: Render state", {
    vin,
    isLoading,
    hasError: !!error,
    dataLength: data?.length || 0,
    publicUrl: !!publicUrl,
  });

  if (isLoading) return <LoadingState />;
  if (error) {
    console.error("ImageGallery: Error state", error);
    return <ErrorState />;
  }
  if (!allImages || allImages.length === 0) {
    console.log("ImageGallery: No data available for VIN", vin);
    return <EmptyState />;
  }
  if (!publicUrl) {
    console.error("ImageGallery: Public URL not configured");
    return <div>Error: Public URL not configured.</div>;
  }
  const filterImagesByType = (images: typeof data, imageType: string) =>
    (Array.isArray(images) ? images : []).filter((image) => image.imageType === imageType);

  const getSlides = (filteredData: typeof data) =>
    (Array.isArray(filteredData) ? filteredData : []).map(({ imageKey }) => ({
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
            const filteredData = filterImagesByType(allImages, type);
            const slides = getSlides(filteredData);

            if (!slides || slides.length === 0) {
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
                      render={{ slide: NextJsImage, thumbnail: NextJsImage }}
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
      {open && (
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          slides={getSlides(allImages)}
          index={startIndex}
          render={{ slide: NextJsImage, thumbnail: NextJsImage }}
          plugins={[...(isMobile ? [] : [Thumbnails]), Download]}
        />
      )}
      <DownloadButton content={allImages} vin={vin} />
    </div>
  );
};
