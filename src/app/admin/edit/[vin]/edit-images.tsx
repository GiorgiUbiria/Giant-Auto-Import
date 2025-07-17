"use client";

import {
  deleteImageAction,
  getImageKeys,
  makeImageMainAction,
  removeAllImagesAction,
} from "@/lib/actions/imageActions";
import {
  useServerActionMutation,
  useServerActionQuery,
} from "@/lib/hooks/server-action-hooks";
import { Loader2, Stamp, Trash } from "lucide-react";
import Image from "next/image";
import { ImagesForm } from "./images-form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";


export const EditImages = ({ vin }: { vin: string }) => {
  const queryClient = useQueryClient();
  const publicUrl = process.env.NEXT_PUBLIC_BUCKET_URL as string;

  // Tabs and pagination state
  const imageTypes = [
    { label: "Warehouse", value: "WAREHOUSE" },
    { label: "Auction", value: "AUCTION" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Pick Up", value: "PICK_UP" },
  ];
  const [selectedType, setSelectedType] = useState<string>(imageTypes[0].value);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [imagesData, setImagesData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch images with type and pagination
  useEffect(() => {
    async function fetchImages() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/test-images?vin=${vin}&type=${selectedType}&page=${page}&pageSize=${pageSize}`);
        const data = await res.json();
        setImagesData(data.images || []);
        setTotalCount(data.count || 0);
      } catch (err) {
        setImagesData([]);
        setTotalCount(0);
      }
      setIsLoading(false);
    }
    fetchImages();
  }, [vin, selectedType, page]);

  const { isPending: deletePending, mutate: deleteMutate } =
    useServerActionMutation(deleteImageAction, {
      onError: (error) => {
        const errorMessage = error?.data || "Failed to delete the image";
        toast.error(errorMessage);
      },
      onSuccess: async () => {
        const successMessage = "Image deleted successfully!"; toast.success(successMessage);
        await queryClient.invalidateQueries({
          queryKey: ["getImagesForCar", vin],
          refetchType: "active",
        });
      },
    });

  const { isPending: makeMainPending, mutate: makeMainMutate } =
    useServerActionMutation(makeImageMainAction, {
      onError: (error) => {
        const errorMessage = error?.data || "Failed to make the image main";
        toast.error(errorMessage);
      },
      onSuccess: async () => {
        const successMessage = "Image prioritized successfully!";
        toast.success(successMessage);

        await queryClient.invalidateQueries({
          queryKey: ["getImagesForCar", vin],
          refetchType: "active",
        });
      },
    });

  const { isPending: removeAllPending, mutate: removeAllMutate } =
    useServerActionMutation(removeAllImagesAction, {
      onError: (error) => {
        const errorMessage = error?.data || "Failed to remove all images";
        toast.error(errorMessage);
      },
      onSuccess: async () => {
        const successMessage = "All images removed successfully!";
        toast.success(successMessage);

        await queryClient.invalidateQueries({
          queryKey: ["getImagesForCar", vin],
          refetchType: "active",
        });
      },
    });

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
            <div className="w-full aspect-[3/2] relative rounded-lg overflow-hidden">
              <Image
                src={image.thumbnailUrl || image.url}
                alt={image.imageKey || "Image"}
                fill
                style={{ objectFit: "cover" }}
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/webp;base64,UklGRiIAAABXRUJQVlA4ICwAAACwAgCdASoCAAIALmk0mk0iIiIiIgBoSywA"
                onError={(e) => {
                  // fallback to original if thumbnail fails, then to placeholder
                  if (e.currentTarget.src !== image.url) {
                    e.currentTarget.src = image.url;
                  } else {
                    e.currentTarget.src = "/no-car-image.webp";
                  }
                }}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex gap-x-2">
              <Button
                variant="link"
                size="icon"
                disabled={makeMainPending || deletePending}
                onClick={() => {
                  deleteMutate({ imageKey: image.imageKey });
                }}
              >
                <Trash className="w-4 h-4 hover:opacity-50 hover:text-red-500 transition" />
              </Button>
              <Button
                variant="link"
                size="icon"
                disabled={makeMainPending || deletePending}
                onClick={() => {
                  makeMainMutate({ imageKey: image.imageKey });
                }}
              >
                <Stamp className="w-4 h-4 hover:opacity-50 hover:text-red-500 transition" />
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
            onClick={() => { setSelectedType(type.value); setPage(1); }}
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
        <span>Page {page} of {totalPages || 1}</span>
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
