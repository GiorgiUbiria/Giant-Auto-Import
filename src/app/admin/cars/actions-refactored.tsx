"use client";

import { Button } from "@/components/ui/button";
import { deleteCarAction } from "@/lib/actions/carActions";
import { useServerActionMutation } from "@/lib/hooks/server-action-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useDeleteConfirmation } from "@/lib/hooks/use-dialog-state";

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

export function ActionsRefactored({ vin, translations }: Props) {
  const queryClient = useQueryClient();
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progressToastId, setProgressToastId] = useState<string | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { confirmDelete } = useDeleteConfirmation();

  const { isPending, mutate } = useServerActionMutation(deleteCarAction, {
    onError: (error) => {
      console.error("Delete car error:", error);
      const errorMessage = error?.data || translations.deleteError;

      // Clear progress interval
      if (progressIntervalRef.current) {
        console.log("Clearing progress interval due to error");
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      // Dismiss progress toast and show error
      if (progressToastId) {
        console.log("Dismissing progress toast due to error");
        toast.dismiss(progressToastId);
      }
      toast.error(errorMessage);

      setIsDeleting(false);
      setDeleteProgress(0);
      setProgressToastId(null);
    },
    onSuccess: async (data) => {
      console.log("Delete car success:", data);
      const successMessage = data?.message || translations.deleteSuccess;

      // Show final progress update
      if (progressToastId) {
        console.log("Showing final completion toast (100%)");
        toast.loading("🎉 Deletion completed successfully! 100%", {
          id: progressToastId,
          duration: 1000, // Show for 1 second
        });
      }

      // Wait a moment then show success
      setTimeout(() => {
        console.log("Dismissing progress toast and showing success");
        // Dismiss progress toast and show success
        if (progressToastId) {
          toast.dismiss(progressToastId);
        }
        toast.success(successMessage);
      }, 1000);

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

      // Clear progress interval
      if (progressIntervalRef.current) {
        console.log("Clearing progress interval after success");
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setIsDeleting(false);
      setDeleteProgress(0);
      setProgressToastId(null);
    },
  });

  const handleDelete = () => {
    console.log("Deleting car with VIN:", vin);
    setIsDeleting(true);
    setDeleteProgress(0);

    // Show initial progress toast
    const toastId = toast.loading("🚗 Starting deletion process...", {
      duration: Infinity, // Keep toast until manually dismissed
    });
    console.log("Created progress toast with ID:", toastId);
    setProgressToastId(toastId as string);

    // Simulate progress with realistic step messages
    const progressSteps = [
      { progress: 10, message: "🔍 Verifying car exists..." },
      { progress: 20, message: "📸 Preparing to delete images..." },
      { progress: 30, message: "🗑️ Deleting images from storage..." },
      { progress: 50, message: "🗃️ Cleaning up database records..." },
      { progress: 70, message: "🚗 Removing car from database..." },
      { progress: 90, message: "✅ Finalizing deletion..." },
    ];

    let currentStep = 0;
    console.log("Starting progress simulation for VIN:", vin);

    const progressInterval = setInterval(() => {
      if (currentStep < progressSteps.length) {
        const step = progressSteps[currentStep];
        setDeleteProgress(step.progress);

        console.log(`Progress step ${currentStep + 1}/${progressSteps.length}: ${step.message} (${step.progress}%)`);

        // Update toast with current step
        if (progressToastId) {
          toast.loading(`${step.message} ${step.progress}%`, {
            id: progressToastId,
            duration: Infinity,
          });
        }
        currentStep++;
      } else {
        console.log("Progress simulation completed, clearing interval");
        clearInterval(progressInterval);
      }
    }, 800); // Update every 800ms for more visible progress

    progressIntervalRef.current = progressInterval;

    mutate({ vin });
  };

  const handleDeleteClick = () => {
    // Use the centralized dialog system instead of local AlertDialog
    confirmDelete(
      `Are you sure you want to delete the car with VIN code ${vin}?`,
      translations.deleteConfirmDescription,
      handleDelete,
      () => {
        // Cancel action - reset any local state if needed
        setIsDeleting(false);
        setDeleteProgress(0);
        if (progressToastId) {
          toast.dismiss(progressToastId);
        }
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      },
      'destructive',
      { vin, action: 'delete-car' }
    );
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

      <Button
        variant="link"
        size="icon"
        title={translations.delete}
        onClick={handleDeleteClick}
        disabled={isDeleting || isPending}
      >
        {isDeleting || isPending ? (
          <Loader2 className="size-4 animate-spin transition" />
        ) : (
          <Trash className="size-4 hover:opacity-50 hover:text-red-500 transition" />
        )}
      </Button>
    </div>
  );
} 