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
import { handleUploadImagesAction } from "@/lib/actions/bucketActions";
import { ImageUploadSection } from "./image-upload-section";
import { BasicInfoSection } from "../shared-form-sections/basic-info-section";
import { AuctionInfoSection } from "../shared-form-sections/auction-info-section";
import { FinancialInfoSection } from "../shared-form-sections/financial-info-section";
import ErrorBoundary from "@/components/ui/error-boundary";
import { useQueryClient } from "@tanstack/react-query";

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
  const { execute: executeImageUpload } = useServerAction(handleUploadImagesAction);

  const processImages = async (
    images: FileList | undefined,
    type: "AUCTION" | "WAREHOUSE" | "DELIVERED" | "PICK_UP",
    vin: string
  ) => {
    if (!images || images.length === 0) return;

    try {
      const imageData = await Promise.all(
        Array.from(images).map(async (file: File) => {
          const arrayBuffer = await file.arrayBuffer();
          return {
            buffer: Array.from(new Uint8Array(arrayBuffer)),
            size: file.size,
            name: file.name,
            type: type,
          };
        })
      );

      const result = await executeImageUpload({
        vin,
        images: imageData,
      });

      return result;
    } catch (error) {
      console.error(`Error processing images for ${type}:`, error);
      throw error;
    }
  };

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
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
        return;
      }

      if (!data || !data.success) {
        console.error("Car addition failed - no success response:", data);
        toast.error(data?.message || "Failed to add car - no success response");
        return;
      }

      console.log("Car added successfully:", data);

      // Show success message immediately
      toast.success(data?.message || "Car added successfully!");

      // Process images in the background (non-blocking)
      const imagePromises = [];

      if (auction_images && auction_images.length > 0) {
        imagePromises.push(processImages(auction_images, "AUCTION", values.vin));
      }
      if (warehouse_images && warehouse_images.length > 0) {
        imagePromises.push(processImages(warehouse_images, "WAREHOUSE", values.vin));
      }
      if (delivery_images && delivery_images.length > 0) {
        imagePromises.push(processImages(delivery_images, "DELIVERED", values.vin));
      }
      if (pick_up_images && pick_up_images.length > 0) {
        imagePromises.push(processImages(pick_up_images, "PICK_UP", values.vin));
      }

      // Process images if any exist, but don't block redirection
      if (imagePromises.length > 0) {
        Promise.all(imagePromises)
          .then(() => {
            console.log("All images processed successfully");
          })
          .catch((imageError) => {
            console.error("Image processing failed:", imageError);
            // Don't show error toast for image processing failures
          });
      }

      // Invalidate React Query cache (non-blocking)
      queryClient.invalidateQueries({
        queryKey: ["getCars"],
        exact: false,
        refetchType: "active",
      }).catch((cacheError) => {
        console.error("Cache invalidation failed:", cacheError);
      });

      // Simple redirect to admin/cars
      console.log("Redirecting to /admin/cars...");
      router.push("/admin/cars");

    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An error occurred while submitting the form");
    }
  };

  // Don't render form until mounted to prevent hydration issues
  if (!isMounted) {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full md:w-2/3 space-y-8 my-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full md:w-2/3 space-y-8 my-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg transition-all">
          <BasicInfoSection form={form} />
          <AuctionInfoSection form={form} />
          <FinancialInfoSection form={form} />
          <ImageUploadSection form={form} />

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding Car..." : "Add Car"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 