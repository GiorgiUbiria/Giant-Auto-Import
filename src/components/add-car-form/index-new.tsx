"use client";

import { Button } from "@/components/ui/button";
import ErrorBoundary from "@/components/ui/error-boundary";
import { Form } from "@/components/ui/form";
import { insertCarSchema } from "@/lib/drizzle/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
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

  // Helper: prepare form data with images
  function prepareFormData(values: z.infer<typeof FormSchema>): FormData {
    const formData = new FormData();

    // Add all car data fields
    Object.entries(values).forEach(([key, value]) => {
      if (key.includes("_images")) {
        // Handle image arrays
        if (value && Array.isArray(value)) {
          value.forEach((file: File) => {
            formData.append(`${key}[]`, file);
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

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      console.log("Submitting car data:", { vin: values.vin, auction: values.auction });

      // Prepare form data with all fields and images
      const formData = prepareFormData(values);

      // Submit to API
      const response = await submitCarToAPI(formData);

      console.log("API response:", response);

      if (!response.success) {
        toast.error(response.message || "Failed to add car");
        return;
      }

      // Show success message
      toast.success(response.message || "Car added successfully");

      // Show image upload results if any
      if (response.data) {
        const { uploadedImages, failedImages } = response.data;
        if (uploadedImages > 0) {
          toast.success(`${uploadedImages} images uploaded successfully`);
        }
        if (failedImages > 0) {
          toast.warning(`${failedImages} images failed to upload. You can add them later.`);
        }
      }

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

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/cars")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Car...
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
