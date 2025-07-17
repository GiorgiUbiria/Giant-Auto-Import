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
import type { GridChildComponentProps } from 'react-window';
import { FixedSizeGrid as Grid } from 'react-window';
import { preconnect, preload } from 'react-dom';

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
  url: string;
};

// Helper: check if a thumbnail exists
async function checkThumbnailExists(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

// Helper: generate thumbnail URL
function getThumbnailUrl(imageKey: string, publicUrl: string): string {
  const extIdx = imageKey.lastIndexOf('.');
  const thumbKey = extIdx !== -1
    ? imageKey.slice(0, extIdx) + '-thumb' + imageKey.slice(extIdx)
    : imageKey + '-thumb';
  return `${publicUrl}/${thumbKey}`;
}

export const FallbackImageGallery = ({ vin, fetchByType = false }: { vin: string, fetchByType?: boolean }) => {
  const imageTypes = ["AUCTION", "PICK_UP", "WAREHOUSE", "DELIVERED"];
  const publicUrl = process.env.NEXT_PUBLIC_BUCKET_URL;
  const [data, setData] = useState<ImageData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [startIndex, setStartIndex] = useState<number>(0);
  const [selectedType, setSelectedType] = useState<string>(imageTypes[0]);
  const [thumbnailCache, setThumbnailCache] = useState<Record<string, boolean>>({});
  const isMobile = useMedia('(max-width: 640px)', false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let url = '';
        if (fetchByType) {
          url = `/api/test-images?vin=${encodeURIComponent(vin)}&type=${encodeURIComponent(selectedType)}&pageSize=0`;
        } else {
          url = `/api/test-images?vin=${encodeURIComponent(vin)}&pageSize=0`;
        }
        const response = await fetch(url);
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch images');
        }
        setData(result.images || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages();
  }, [vin, fetchByType, selectedType]);

  // Check thumbnails for visible images
  useEffect(() => {
    if (!data || !publicUrl) return;

    const checkThumbnails = async () => {
      const newCache = { ...thumbnailCache };
      const promises = data.map(async (img) => {
        if (newCache[img.imageKey] !== undefined) return; // Already checked
        
        const thumbUrl = getThumbnailUrl(img.imageKey, publicUrl);
        const hasThumb = await checkThumbnailExists(thumbUrl);
        newCache[img.imageKey] = hasThumb;
      });

      await Promise.all(promises);
      setThumbnailCache(newCache);
    };

    checkThumbnails();
  }, [data, publicUrl, thumbnailCache]);

  // Preconnect and preload for CDN
  if (publicUrl) {
    preconnect(publicUrl);
    if (data && data.length > 0) {
      preload(`${publicUrl}/${data[0].imageKey}`, { as: 'image' });
    }
  }

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;
  if (!data || data.length === 0) return <EmptyState />;
  if (!publicUrl) return <div>Error: Public URL not configured.</div>;

  const filterImagesByType = (images: ImageData[], imageType: string) =>
    images.filter((image) => image.imageType === imageType);

  const VirtualizedGrid = ({ images, onThumbClick }: { images: ImageData[], onThumbClick: (idx: number) => void }) => {
    const columnCount = isMobile ? 3 : 6;
    const rowCount = Math.ceil(images.length / columnCount);
    const cellWidth = 100;
    const cellHeight = 80;
    return (
      <Grid
        columnCount={columnCount}
        columnWidth={cellWidth}
        height={Math.min(320, rowCount * cellHeight)}
        rowCount={rowCount}
        rowHeight={cellHeight}
        width={columnCount * cellWidth}
      >
        {({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
          const idx = rowIndex * columnCount + columnIndex;
          if (idx >= images.length) return null;
          const image = images[idx];
          const thumbUrl = getThumbnailUrl(image.imageKey, publicUrl);
          const hasThumb = thumbnailCache[image.imageKey];
          
          return (
            <div style={style} key={image.imageKey} onClick={() => onThumbClick(idx)}>
              <img
                src={hasThumb ? thumbUrl : image.url}
                alt={image.imageType}
                width={90}
                height={70}
                style={{ objectFit: 'cover', borderRadius: 4, cursor: 'pointer', margin: 4 }}
                loading="lazy"
              />
            </div>
          );
        }}
      </Grid>
    );
  };

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
      <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full text-black dark:text-white gap-2">
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
              render={{ slide: NextJsImage, thumbnail: NextJsImage }}
              plugins={[...(isMobile ? [] : [Thumbnails]), Download]}
            />
          );
        })()
      )}
      <DownloadButton content={data} vin={vin} />
    </div>
  );
}; 