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
import { ErrorBoundary } from "@/components/ui/error-boundary";
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
  const [isProcessing, setIsProcessing] = useState(false);
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
    setIsProcessing(true);
    
    // Add a timeout to prevent hanging
    const timeoutId = setTimeout(() => {
      console.error("Form submission timed out after 30 seconds");
      toast.error("Form submission timed out. Please try again.");
      setIsProcessing(false);
    }, 30000);
    
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
      
      // Add more detailed logging for debugging
      console.log("Form data being sent:", carDataWithDate);
      
      const [data, error] = await execute(carDataWithDate);
      
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      console.log("Server action response:", { data, error });
      
      if (error) {
        console.error("Car addition failed:", error);
        console.error("Error details:", {
          message: error.message,
          data: error.data
        });
        toast.error(error.data || "Failed to add car");
        return;
      }

      if (!data || !data.success) {
        console.error("Car addition failed - no success response:", data);
        toast.error(data?.message || "Failed to add car - no success response");
        return;
      }

      console.log("Car added successfully:", data);

      // Process all image types in parallel
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

      // Process images if any exist, but don't block redirection on image processing errors
      if (imagePromises.length > 0) {
        try {
          await Promise.all(imagePromises);
          console.log("All images processed successfully");
        } catch (imageError) {
          console.error("Image processing failed, but continuing with redirect:", imageError);
          // Don't block redirection on image processing errors
        }
      }

      // Show success message immediately
      toast.success(data?.message || "Car added successfully!");
      
      // Invalidate React Query cache in the background (non-blocking)
      console.log("Invalidating getCars queries after adding car...");
      queryClient.invalidateQueries({
        queryKey: ["getCars"],
        exact: false,
        refetchType: "active",
      }).catch((cacheError) => {
        console.error("Cache invalidation failed:", cacheError);
      });

      // Redirect immediately without waiting for cache invalidation
      console.log("Redirecting to /admin/cars...");
      
      // Use a more robust redirection approach with multiple fallbacks
      const performRedirect = () => {
        try {
          // Method 1: Try router.push first
          router.push("/admin/cars");
          console.log("Router.push called successfully");
        } catch (error) {
          console.error("Router.push failed:", error);
          // Method 2: Fallback to window.location.href
          window.location.href = "/admin/cars";
        }
      };

      // Execute redirect immediately
      performRedirect();
      
      // Fallback 1: Check if redirect worked after 500ms
      setTimeout(() => {
        if (window.location.pathname !== "/admin/cars") {
          console.log("Redirect check 1: Still on same page, trying window.location.href");
          window.location.href = "/admin/cars";
        }
      }, 500);
      
      // Fallback 2: Final check after 1 second
      setTimeout(() => {
        if (window.location.pathname !== "/admin/cars") {
          console.log("Redirect check 2: Still on same page, forcing redirect");
          window.location.href = "/admin/cars";
        }
      }, 1000);
      
      // Fallback 3: Last resort after 2 seconds
      setTimeout(() => {
        if (window.location.pathname !== "/admin/cars") {
          console.log("Redirect check 3: Final fallback, using window.location.replace");
          window.location.replace("/admin/cars");
        }
      }, 2000);
      
    } catch (error) {
      // Clear the timeout since we got an error
      clearTimeout(timeoutId);
      console.error("Form submission error:", error);
      toast.error("An error occurred while submitting the form or processing images");
    } finally {
      setIsProcessing(false);
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
              disabled={isPending || isProcessing}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || isProcessing}>
              {isPending || isProcessing ? "Adding Car..." : "Add Car"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 