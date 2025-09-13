"use client";

import { Button } from "@/components/ui/button";
import ErrorBoundary from "@/components/ui/error-boundary";
import { Form } from "@/components/ui/form";
import { insertCarSchema } from "@/lib/drizzle/schema";
import {
  showUploadResult,
  uploadImagesWithProgress,
  type ImageUploadResult,
} from "@/lib/utils/imageUpload";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuctionInfoSection } from "../shared-form-sections/auction-info-section";
import { BasicInfoSection } from "../shared-form-sections/basic-info-section";
import { FinancialInfoSection } from "../shared-form-sections/financial-info-section";
import { ImageUploadSection } from "./image-upload-section";

// Extended schema to include image fields
const FormSchema = insertCarSchema.omit({ id: true, destinationPort: true }).extend({
  auction_images: z.any().optional(),
  pick_up_images: z.any().optional(),
  warehouse_images: z.any().optional(),
  delivery_images: z.any().optional(),
  purchaseDate: z.date().optional(),
});

export function AddCarForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ total: 0, uploaded: 0, failed: 0 });
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // Improved hydration handling
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      vin: "",
      year: new Date().getFullYear(),
      make: "",
      model: "",
      auction: "Copart",
      originPort: "NJ",
      keys: "UNKNOWN",
      auctionLocation: "",
      title: "PENDING",
      shippingStatus: "AUCTION",
      bodyType: "SEDAN",
      fuelType: "GASOLINE",
      bookingNumber: "",
      containerNumber: "",
      lotNumber: "",
      trackingLink: "",
      purchaseFee: 0,
      departureDate: undefined,
      arrivalDate: undefined,
      purchaseDate: new Date(),
      ownerId: "",
      insurance: "NO",
      auction_images: undefined,
      pick_up_images: undefined,
      warehouse_images: undefined,
      delivery_images: undefined,
    },
  });

  // API submission function
  const submitCarToAPI = async (formData: FormData) => {
    const response = await fetch("/api/cars", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to create car");
    }

    return response.json();
  };

  // Helper: prepare image files for upload
  function prepareImageFiles(values: z.infer<typeof FormSchema>) {
    const imageTypes = ["auction_images", "pick_up_images", "warehouse_images", "delivery_images"];
    const imageFiles: Record<string, FileList | undefined> = {};

    imageTypes.forEach((type) => {
      const files = values[type as keyof typeof values] as FileList | undefined;
      if (files && files.length > 0) {
        imageFiles[type] = files;
      }
    });

    return imageFiles;
  }

  // Helper: prepare form data with images
  function prepareFormData(values: z.infer<typeof FormSchema>): FormData {
    const formData = new FormData();

    // Add all car data fields
    Object.entries(values).forEach(([key, value]) => {
      if (key.includes("_images")) {
        // Handle image files (FileList or Array)
        if (value) {
          const files = Array.isArray(value) ? value : Array.from(value as FileList);
          files.forEach((file: File) => {
            if (file && file.size > 0) {
              formData.append(`${key}[]`, file);
            }
          });
        }
      } else if (value !== undefined && value !== null) {
        // Handle other fields
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, String(value));
        }
      }
    });

    return formData;
  }

  // Helper: process and upload images using standardized logic
  async function processAndUploadImages(
    values: z.infer<typeof FormSchema>,
    vin: string
  ): Promise<ImageUploadResult> {
    const imageFiles = prepareImageFiles(values);

    // Check if there are any images to upload
    const hasImages = Object.values(imageFiles).some((files) => files && files.length > 0);
    if (!hasImages) {
      return {
        success: true,
        uploadedCount: 0,
        failedCount: 0,
        failedImages: [],
        message: "No images to upload",
      };
    }

    setIsUploadingImages(true);
    setUploadProgress({ total: 0, uploaded: 0, failed: 0 });

    try {
      const result = await uploadImagesWithProgress(vin, imageFiles, (uploaded, total) => {
        setUploadProgress({ total, uploaded, failed: total - uploaded });
      });

      return result;
    } finally {
      setIsUploadingImages(false);
    }
  }

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      console.log("Submitting car data:", { vin: values.vin, auction: values.auction });

      // Prepare form data with all fields (without images for now)
      const formData = prepareFormData(values);

      // Submit car data to API
      const response = await submitCarToAPI(formData);

      console.log("API response:", response);

      if (!response.success) {
        toast.error(response.message || "Failed to add car");
        return;
      }

      // Show success message for car creation
      toast.success(response.message || "Car added successfully");

      // Process and upload images separately
      const imageResults = await processAndUploadImages(values, values.vin);

      // Show image upload results using standardized display
      showUploadResult(imageResults);

      // Invalidate and refetch cars data
      queryClient.invalidateQueries({ queryKey: ["cars"] });

      // Reset form
      form.reset();

      // Navigate to cars list
      router.push("/admin/cars");
    } catch (error) {
      console.error("Error during car addition:", error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="w-full h-40 grid place-items-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="w-full max-w-4xl mx-auto p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <BasicInfoSection form={form} />
            <AuctionInfoSection form={form} />
            <FinancialInfoSection form={form} />
            <ImageUploadSection form={form} />

            {/* Upload Progress Indicator */}
            {isUploadingImages && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Uploading Images...
                  </span>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${uploadProgress.total > 0 ? (uploadProgress.uploaded / uploadProgress.total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-blue-700 dark:text-blue-300">
                  <span>
                    {uploadProgress.uploaded} of {uploadProgress.total} uploaded
                  </span>
                  {uploadProgress.failed > 0 && (
                    <span className="text-red-600 dark:text-red-400">
                      {uploadProgress.failed} failed
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/cars")}
                disabled={isSubmitting || isUploadingImages}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploadingImages}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Car...
                  </>
                ) : isUploadingImages ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-pulse" />
                    Uploading Images...
                  </>
                ) : (
                  "Add Car"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </ErrorBoundary>
  );
}
