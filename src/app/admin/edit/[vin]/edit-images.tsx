"use client";

import {
  deleteImageAction,
  getImagesAction,
  makeImageMainAction,
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
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const EditImages = ({ vin }: { vin: string }) => {
  const queryClient = useQueryClient();

  const { isLoading, data } = useServerActionQuery(getImagesAction, {
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
        const successMessage = "Image deleted successfully!";
        toast.success(successMessage);

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

  const LoadingState = () => {
    return (
      <div className="w-full h-full grid place-items-center">
        <Loader2 className="animate-spin text-center" />
      </div>
    );
  };

  return (
    <div className="flex flex-col mb-8">
      <ImagesForm vin={vin} />
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {isLoading ? (
          <LoadingState />
        ) : (
          data?.map((image) => (
            <TooltipProvider key={image.imageKey}>
              <Tooltip>
                <TooltipTrigger className="w-full">
                  <div className="w-full aspect-[3/2] relative rounded-lg overflow-hidden">
                    <Image
                      src={image.url}
                      alt="Image"
                      layout="fill"
                      objectFit="cover"
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
          ))
        )}
      </div>
    </div>
  );
};