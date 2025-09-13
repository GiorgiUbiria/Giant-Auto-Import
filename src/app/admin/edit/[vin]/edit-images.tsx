"use client";

import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { imageCacheService } from "@/lib/services/imageCache";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Stamp, Trash } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ImagesForm } from "./images-form";

export const EditImages = ({ vin }: { vin: string }) => {
  const queryClient = useQueryClient();

  // Tabs and pagination state
  const imageTypes = [
    { label: "Warehouse", value: "WAREHOUSE" },
    { label: "Auction", value: "AUCTION" },
    { label: "Delivered", value: "DELIVERY" },
    { label: "Pick Up", value: "PICK_UP" },
  ];
  const [selectedType, setSelectedType] = useState<string>(imageTypes[0].value);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [imagesData, setImagesData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch images with type and pagination using cache service
  useEffect(() => {
    async function fetchImages() {
      setIsLoading(true);
      try {
        const data = await imageCacheService.getImageList({
          vin,
          type: selectedType,
          page,
          pageSize,
          revalidate: 30, // 30 seconds cache for admin
        });

        setImagesData(data.images || []);
        setTotalCount(data.count || 0);
      } catch (err) {
        console.error("Failed to fetch images:", err);
        setImagesData([]);
        setTotalCount(0);
        toast.error("Failed to load images. Please try again.");
      }
      setIsLoading(false);
    }
    fetchImages();
  }, [vin, selectedType, page]);

  const [deletePending, setDeletePending] = useState(false);
  const deleteMutate = async ({ imageKey }: { imageKey: string }) => {
    setDeletePending(true);
    try {
      const resp = await fetch(`/api/images/${vin}?imageKey=${encodeURIComponent(imageKey)}`, {
        method: "DELETE",
      });
      if (!resp.ok) throw new Error("Failed to delete image");

      toast.success("Image deleted successfully!");
      imageCacheService.clear(vin);
      setImagesData((prev) => prev.filter((img) => img.imageKey !== imageKey));
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["getImagesForCar", vin],
          refetchType: "active",
        }),
        queryClient.invalidateQueries({ queryKey: ["getImage", vin], refetchType: "active" }),
        queryClient.invalidateQueries({ queryKey: ["getImages"], refetchType: "active" }),
      ]);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete the image");
    } finally {
      setDeletePending(false);
    }
  };

  const [makeMainPending, setMakeMainPending] = useState(false);
  const makeMainMutate = async ({ imageKey }: { imageKey: string }) => {
    setMakeMainPending(true);
    try {
      const resp = await fetch(`/api/images/${vin}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "makeMain", imageKey }),
      });
      if (!resp.ok) throw new Error("Failed to make the image main");

      toast.success("Image prioritized successfully!");
      imageCacheService.clear(vin);
      setImagesData((prev) => prev.map((img) => ({ ...img, priority: img.imageKey === imageKey })));
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["getImagesForCar", vin],
          refetchType: "active",
        }),
        queryClient.invalidateQueries({ queryKey: ["getImage", vin], refetchType: "active" }),
        queryClient.invalidateQueries({ queryKey: ["getImages"], refetchType: "active" }),
      ]);
    } catch (err: any) {
      toast.error(err?.message || "Failed to make the image main");
    } finally {
      setMakeMainPending(false);
    }
  };

  const [removeAllPending, setRemoveAllPending] = useState(false);
  const removeAllMutate = async () => {
    setRemoveAllPending(true);
    try {
      const resp = await fetch(`/api/images/${vin}`, { method: "DELETE" });
      if (!resp.ok) throw new Error("Failed to remove all images");
      toast.success("All images removed successfully!");
      imageCacheService.clear(vin);
      setImagesData([]);
      setTotalCount(0);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["getImagesForCar", vin],
          refetchType: "active",
        }),
        queryClient.invalidateQueries({ queryKey: ["getImage", vin], refetchType: "active" }),
        queryClient.invalidateQueries({ queryKey: ["getImages"], refetchType: "active" }),
      ]);
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove all images");
    } finally {
      setRemoveAllPending(false);
    }
  };

  const LoadingState = () => {
    return (
      <div className="w-full h-full grid place-items-center">
        <Loader2 className="animate-spin text-center" />
      </div>
    );
  };

  // Memoize image list rendering for performance
  const memoizedImageList = useMemo(() => {
    if (!imagesData) return null;
    return imagesData.map((image) => (
      <TooltipProvider key={image.imageKey}>
        <Tooltip>
          <TooltipTrigger className="w-full">
            <div className="w-full aspect-[3/2] relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <OptimizedImage
                src={image.url}
                alt={image.imageKey || "Image"}
                fill
                objectFit="cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={() => {
                  console.warn(`Failed to load image: ${image.imageKey}`);
                }}
              />
              {/* Priority indicator */}
              {image.priority && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                  Main
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex gap-x-2">
              <Button
                variant="link"
                size="icon"
                disabled={makeMainPending || deletePending}
                onClick={() => {
                  void deleteMutate({ imageKey: image.imageKey });
                }}
              >
                <Trash className="w-4 h-4 hover:opacity-50 hover:text-red-500 transition" />
              </Button>
              <Button
                variant="link"
                size="icon"
                disabled={makeMainPending || deletePending || image.priority}
                onClick={() => {
                  void makeMainMutate({ imageKey: image.imageKey });
                }}
              >
                <Stamp
                  className={`w-4 h-4 transition ${
                    image.priority ? "text-green-500" : "hover:opacity-50 hover:text-blue-500"
                  }`}
                />
              </Button>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ));
  }, [imagesData, makeMainPending, deletePending, deleteMutate, makeMainMutate]);

  // Pagination controls
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="flex flex-col mb-8">
      <ImagesForm vin={vin} />
      {/* Tabs for type selection */}
      <div className="flex gap-2 mb-4">
        {imageTypes.map((type) => (
          <Button
            key={type.value}
            variant={selectedType === type.value ? "default" : "outline"}
            onClick={() => {
              setSelectedType(type.value);
              setPage(1);
            }}
          >
            {type.label}
          </Button>
        ))}
      </div>
      {/* Pagination controls */}
      <div className="flex justify-between items-center mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span>
          Page {page} of {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
        >
          Next
        </Button>
      </div>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {isLoading ? (
          <div className="w-full h-[400px] flex justify-center items-center">
            <Loader2 className="animate-spin text-center" />
          </div>
        ) : (
          memoizedImageList
        )}
      </div>
    </div>
  );
};
