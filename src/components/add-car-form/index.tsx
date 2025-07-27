"use client";

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
import { useState, useEffect, Suspense, lazy } from "react";
import { handleUploadImagesAction } from "@/lib/actions/bucketActions";
import { ImageUploadSection } from "./image-upload-section";
import { preloadAllFormResources } from "@/lib/preload-utils";

// Lazy load form sections to reduce initial bundle size
const BasicInfoSection = lazy(() => 
  import("../shared-form-sections/basic-info-section").then(mod => ({ default: mod.BasicInfoSection }))
);

const AuctionInfoSection = lazy(() => 
  import("../shared-form-sections/auction-info-section").then(mod => ({ default: mod.AuctionInfoSection }))
);

const FinancialInfoSection = lazy(() => 
  import("../shared-form-sections/financial-info-section").then(mod => ({ default: mod.FinancialInfoSection }))
);

// Loading component for form sections
const FormSectionLoader = () => (
  <div className="w-full p-6 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      ))}
    </div>
  </div>
);

// Extended schema to include image fields
const FormSchema = insertCarSchema.omit({ id: true, destinationPort: true }).extend({
  auction_images: z.any().optional(),
  pick_up_images: z.any().optional(),
  warehouse_images: z.any().optional(),
  delivery_images: z.any().optional(),
  purchaseDate: z.date().optional(),
});

function AddCarFormContent() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      vin: "",
      year: 2024,
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
      purchaseDate: undefined,
      ownerId: "",
      insurance: "NO",
      auction_images: undefined,
      pick_up_images: undefined,
      warehouse_images: undefined,
      delivery_images: undefined,
    },
  });

  // Improved hydration handling with preloading
  useEffect(() => {
    setIsHydrated(true);
    
    // Preload all form resources for better performance
    preloadAllFormResources();
    
    // Set dynamic values after hydration
    const currentYear = new Date().getFullYear();
    if (form.getValues("year") !== currentYear) {
      form.setValue("year", currentYear);
    }
    
    const currentPurchaseDate = form.getValues("purchaseDate");
    if (!currentPurchaseDate) {
      form.setValue("purchaseDate", new Date());
    }
  }, [form]);

  const { isPending, execute } = useServerAction(addCarAction);
  const { execute: executeImageUpload } = useServerAction(handleUploadImagesAction);

  const processImages = async (
    images: FileList | undefined,
    type: "AUCTION" | "WAREHOUSE" | "DELIVERED" | "PICK_UP",
    vin: string
  ) => {
    if (!images || images.length === 0) return;

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
  };

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setIsProcessing(true);
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

      const [data, error] = await execute(carDataWithDate);
      
      if (error) {
        toast.error(error.data || "Failed to add car");
        return;
      }

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

      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
      }

      toast.success(data?.message || "Car added successfully!");
      router.push("/admin/cars");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while submitting the form or processing images");
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't render form until hydrated
  if (!isHydrated) {
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
          <Suspense fallback={<FormSectionLoader />}>
            <BasicInfoSection form={form} />
          </Suspense>
          
          <Suspense fallback={<FormSectionLoader />}>
            <AuctionInfoSection form={form} />
          </Suspense>
          
          <Suspense fallback={<FormSectionLoader />}>
            <FinancialInfoSection form={form} />
          </Suspense>
          
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

export function AddCarForm() {
  return <AddCarFormContent />;
} 