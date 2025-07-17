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
import { useMemo } from "react";


export const EditImages = ({ vin }: { vin: string }) => {
  const queryClient = useQueryClient();
  const publicUrl = process.env.NEXT_PUBLIC_BUCKET_URL as string

  const { isLoading, data } = useServerActionQuery(getImageKeys, {
    input: {
      vin: vin,
    },
    queryKey: ["getImagesForCar", vin],
  });

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
    if (!data) return null;
    return data.map((image) => (
      <TooltipProvider key={image.imageKey}>
        <Tooltip>
          <TooltipTrigger className="w-full">
            <div className="w-full aspect-[3/2] relative rounded-lg overflow-hidden">
              <Image
                src={`${publicUrl}/${image.imageKey}`}
                alt={image.imageKey || "Image"}
                fill
                style={{ objectFit: "cover" }}
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/webp;base64,UklGRiIAAABXRUJQVlA4ICwAAACwAgCdASoCAAIALmk0mk0iIiIiIgBoSywA"
                onError={(e) => {
                  // fallback to a placeholder image if loading fails
                  e.currentTarget.src = "/no-car-image.webp";
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
  }, [data, publicUrl, makeMainPending, deletePending, deleteMutate, makeMainMutate]);

  return (
    <div className="flex flex-col mb-8">
      <ImagesForm vin={vin} />
      {data && data.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={removeAllPending}>
              {removeAllPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remove All Images"}
            </Button>
          </DialogTrigger>
          <DialogContent className="text-primary">
            <DialogHeader>
              <DialogTitle>Remove All Images</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove all images? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  disabled={removeAllPending}
                  onClick={() => {
                    removeAllMutate({ vin: vin });
                  }}
                >
                  {removeAllPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {isLoading ? (
          <LoadingState />
        ) : (
          memoizedImageList
        )}
      </div>
    </div>
  );
};
