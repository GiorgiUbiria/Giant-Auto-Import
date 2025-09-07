"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { addCarAction } from "@/lib/actions/carActions";
import { insertCarSchema } from "@/lib/drizzle/schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useServerAction } from "zsa-react";
import { useState, useEffect } from "react";
// Upload via API helper
import { ImageUploadSection } from "./image-upload-section";
import { BasicInfoSection } from "../shared-form-sections/basic-info-section";
import { AuctionInfoSection } from "../shared-form-sections/auction-info-section";
import { FinancialInfoSection } from "../shared-form-sections/financial-info-section";
import ErrorBoundary from "@/components/ui/error-boundary";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";

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
  const [uploadProgress, setUploadProgress] = useState({ total: 0, uploaded: 0 });

  // Add debugging for router initialization
  useEffect(() => {
    console.log("AddCarForm: Router initialized", {
      pathname: typeof window !== 'undefined' ? window.location.pathname : 'server'
    });
  }, [router]);

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

  // Improved hydration handling
  useEffect(() => {
    // Use a small delay to ensure proper hydration
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const { isPending, execute } = useServerAction(addCarAction);
  const executeImageUpload = async (payload: { vin: string; images: Array<{ buffer: number[]; size: number; name: string; type: "AUCTION" | "WAREHOUSE" | "DELIVERED" | "PICK_UP" }> }) => {
    const resp = await fetch(`/api/images/${payload.vin}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: payload.images }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err?.error || 'Failed to upload images');
    }
    return resp.json();
  };

  // Compression options
  const compressionOptions = {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.6,
    fileType: 'image/png',
  };

  // Check if imageCompression is available
  const isImageCompressionAvailable = typeof imageCompression === 'function';



  // Helper: upload all images with proper progress tracking
  async function uploadAllImages(allFiles: Array<{ file: File; type: "AUCTION" | "WAREHOUSE" | "DELIVERED" | "PICK_UP" }>, vin: string) {
    let uploaded = 0;
    setUploadProgress({ total: allFiles.length, uploaded: 0 });

    console.log(`Starting sequential upload of ${allFiles.length} images for VIN ${vin}`);

    // Process images one by one for maximum reliability
    for (let i = 0; i < allFiles.length; i++) {
      const { file, type } = allFiles[i];

      try {
        console.log(`Processing image ${i + 1}/${allFiles.length}: ${file.name}`);

        let compressedFile: File = file;
        if (isImageCompressionAvailable) {
          try {
            compressedFile = await imageCompression(file, compressionOptions);
            console.log(`Compressed ${file.name}: ${file.size} -> ${compressedFile.size} bytes`);
          } catch (err) {
            console.warn("Compression failed, using original file:", err);
            compressedFile = file;
          }
        }

        // Prepare thumbnail version (even partner)
        let thumbFile: File = compressedFile;
        try {
          thumbFile = await imageCompression(file, {
            maxWidthOrHeight: 480,
            maxSizeMB: 0.25,
            initialQuality: 0.5,
            useWebWorker: true,
            fileType: 'image/png',
          });
        } catch (err) {
          console.warn('Thumbnail compression failed, using main compressed file:', err);
          thumbFile = compressedFile;
        }

        // Prepare upload data for original + thumbnail
        const arrayBuffer = await compressedFile.arrayBuffer();
        const thumbBuffer = await thumbFile.arrayBuffer();
        const uploadData = [
          {
            buffer: Array.from(new Uint8Array(arrayBuffer)),
            size: compressedFile.size,
            name: compressedFile.name,
            type: type,
          },
          {
            buffer: Array.from(new Uint8Array(thumbBuffer)),
            size: thumbFile.size,
            name: `thumb_${compressedFile.name}`,
            type: type,
          }
        ];

        // Upload single image with retry logic
        let uploadSuccess = false;
        let retryCount = 0;
        const maxRetries = 3;

        while (!uploadSuccess && retryCount <= maxRetries) {
          try {
            console.log(`Uploading ${compressedFile.name} (attempt ${retryCount + 1}/${maxRetries + 1})`);

            await executeImageUpload({
              vin,
              images: uploadData,
            });

            uploadSuccess = true;
            console.log(`Successfully uploaded ${compressedFile.name}`);
          } catch (error) {
            retryCount++;
            console.error(`Failed to upload ${file.name} (attempt ${retryCount}/${maxRetries + 1}):`, error);

            if (retryCount <= maxRetries) {
              // Exponential backoff: 1s, 2s, 4s
              const delay = Math.pow(2, retryCount - 1) * 1000;
              console.log(`Retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }

        if (uploadSuccess) {
          uploaded++;
          setUploadProgress({ total: allFiles.length, uploaded });

          // Update progress message
          const progressPercent = Math.round((uploaded / allFiles.length) * 100);
          console.log(`Uploaded ${uploaded}/${allFiles.length} (${progressPercent}%): ${compressedFile.name}`);

          // Small delay between uploads to prevent rate limiting
          if (i < allFiles.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } else {
          console.error(`Failed to upload ${file.name} after ${maxRetries + 1} attempts`);
          uploaded++;
          setUploadProgress({ total: allFiles.length, uploaded });
        }
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
        uploaded++;
        setUploadProgress({ total: allFiles.length, uploaded });
      }
    }

    console.log(`Upload process completed. Successfully uploaded ${uploaded}/${allFiles.length} images`);
  }

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);
    setUploadProgress({ total: 0, uploaded: 0 });

    // Add timeout only for car addition, not for image uploads
    const timeoutId = setTimeout(() => {
      console.error("Car addition timeout - taking too long");
      toast.error("Car addition is taking longer than expected. Please try again.");
      setIsSubmitting(false);
      setUploadProgress({ total: 0, uploaded: 0 });
    }, 15000); // 15 second timeout for car addition only

    try {
      const {
        warehouse_images,
        auction_images,
        pick_up_images,
        delivery_images,
        purchaseDate,
        ...carData
      } = values;

      const carDataWithDate = {
        ...carData,
        purchaseDate: purchaseDate || new Date(),
      };

      console.log("Submitting car data:", { vin: carDataWithDate.vin, auction: carDataWithDate.auction });

      // Execute the car addition
      const [data, error] = await execute(carDataWithDate);

      console.log("Server action response:", { data, error });

      if (error) {
        console.error("Car addition failed:", error);
        toast.error(error.data || "Failed to add car");
        setIsSubmitting(false);
        return;
      }

      if (!data || !data.success) {
        console.error("Car addition failed - no success response:", data);
        toast.error(data?.message || "Failed to add car - no success response");
        setIsSubmitting(false);
        return;
      }

      console.log("Car added successfully:", data);

      // Clear timeout since car addition succeeded
      clearTimeout(timeoutId);

      // Gather all files with their types
      const allFiles: Array<{ file: File; type: "AUCTION" | "WAREHOUSE" | "DELIVERED" | "PICK_UP" }> = [];

      if (warehouse_images) {
        Array.from(warehouse_images).forEach((file) => {
          allFiles.push({ file: file as File, type: "WAREHOUSE" as const });
        });
      }
      if (auction_images) {
        Array.from(auction_images).forEach((file) => {
          allFiles.push({ file: file as File, type: "AUCTION" as const });
        });
      }
      if (delivery_images) {
        Array.from(delivery_images).forEach((file) => {
          allFiles.push({ file: file as File, type: "DELIVERED" as const });
        });
      }
      if (pick_up_images) {
        Array.from(pick_up_images).forEach((file) => {
          allFiles.push({ file: file as File, type: "PICK_UP" as const });
        });
      }

      // Process images if any exist (no timeout for image uploads)
      if (allFiles.length > 0) {
        try {
          console.log(`Starting upload of ${allFiles.length} images...`);
          const startTime = Date.now();
          await uploadAllImages(allFiles, values.vin);
          const endTime = Date.now();
          const uploadDuration = (endTime - startTime) / 1000;
          console.log(`All images processed successfully in ${uploadDuration.toFixed(1)}s`);

          // Show success message only after all uploads complete
          toast.success(`Car added successfully! Uploaded ${allFiles.length} images in ${uploadDuration.toFixed(1)}s`);
        } catch (imageError) {
          console.error("Image processing failed:", imageError);
          toast.error("Car added successfully, but some images failed to upload");
        }
      } else {
        console.log("No images to upload");
        // Show success message immediately if no images
        toast.success(data?.message || "Car added successfully!");
      }

      // Invalidate React Query cache
      await queryClient.invalidateQueries({
        queryKey: ["getCars"],
        exact: false,
        refetchType: "active",
      });

      // Reset form and progress
      setUploadProgress({ total: 0, uploaded: 0 });
      setIsSubmitting(false);
      clearTimeout(timeoutId);

      // Redirect to admin/cars
      console.log("Redirecting to /admin/cars...");
      router.push("/admin/cars");

    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An error occurred while submitting the form");
      setIsSubmitting(false);
      setUploadProgress({ total: 0, uploaded: 0 });
      clearTimeout(timeoutId);
    }
  };

  // Don't render form until mounted to prevent hydration issues
  if (!isMounted) {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full md:w-2/3 space-y-8 my-8 bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading form...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full md:w-2/3 space-y-8 my-8 bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all">
          <BasicInfoSection form={form} />
          <AuctionInfoSection form={form} />
          <FinancialInfoSection form={form} />
          <ImageUploadSection form={form} />

          {/* Upload Progress Bar */}
          {uploadProgress.total > 0 && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Uploading Images...</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {uploadProgress.uploaded} of {uploadProgress.total} ({Math.round((uploadProgress.uploaded / uploadProgress.total) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(uploadProgress.uploaded / uploadProgress.total) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {uploadProgress.total - uploadProgress.uploaded} images remaining • Sequential upload for reliability
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending || isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploadProgress.total > 0 ? "Uploading Images..." : "Adding Car..."}
                </>
              ) : (
                "Add Car"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 