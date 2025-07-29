"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteCarAction } from "@/lib/actions/carActions";
import { useServerActionMutation } from "@/lib/hooks/server-action-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type Props = {
  vin: string;
  translations: {
    edit: string;
    delete: string;
    deleteConfirmDescription: string;
    cancel: string;
    deleteAction: string;
    deleting: string;
    deleteSuccess: string;
    deleteError: string;
  };
};

export function Actions({ vin, translations }: Props) {
  const queryClient = useQueryClient();

  const { isPending, mutate } = useServerActionMutation(deleteCarAction, {
    onError: (error) => {
      console.error("Delete car error:", error);
      const errorMessage = error?.data || translations.deleteError;
      toast.error(errorMessage);
    },
    onSuccess: async (data) => {
      console.log("Delete car success:", data);
      const successMessage = data?.message || translations.deleteSuccess;
      toast.success(successMessage);

      console.log("Invalidating getCars queries...");
      
      // Invalidate all getCars queries to ensure UI updates
      await queryClient.invalidateQueries({
        queryKey: ["getCars"],
        exact: false, // This will invalidate all queries that start with ["getCars"]
        refetchType: "active",
      });

      console.log("Forcing refetch of getCars queries...");
      
      // Force refetch to ensure immediate UI update
      await queryClient.refetchQueries({
        queryKey: ["getCars"],
        exact: false,
        type: "active",
      });

      console.log("Cache invalidation and refetch completed");
    },
  });

  const handleDelete = () => {
    console.log("Deleting car with VIN:", vin);
    mutate({ vin });
  };

  return (
    <div className="flex justify-center items-center gap-x-2">
      <Link
        href={`/admin/edit/${vin}`}
        className="hover:text-blue-500 hover:underline"
        title={translations.edit}
      >
        <Pencil className="size-4 hover:opacity-50 transition" />
      </Link>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="link" size="icon" title={translations.delete}>
            <Trash className="size-4 hover:opacity-50 hover:text-red-500 transition" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="text-primary">
          <AlertDialogHeader>
            <AlertDialogTitle className="leading-relaxed">
              Are you sure you want to delete the car with VIN code {vin}?
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              {translations.deleteConfirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{translations.cancel}</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleDelete}>
                {isPending ? (
                  <Loader2 className="size-2 animate-spin transition" />
                ) : (
                  translations.deleteAction
                )}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
