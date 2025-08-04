"use client";
import { TooltipProvider } from "@/components/ui/tooltip";
import StatusLine from "./status-line";
import CarInfo from "./car-info";
import { FallbackImageGallery } from "./fallback-image-gallery";
import { selectCarSchema } from "@/lib/drizzle/schema";
import { z } from "zod";
import { useEffect } from "react";
import { useCarStateAndActions } from "./use-car-state";

export default function CarClientView({ carData }: { carData?: z.infer<typeof selectCarSchema> }) {
  const { setCarData, resetCarState } = useCarStateAndActions();

  // Sync car data with Jotai atoms
  useEffect(() => {
    if (carData) {
      setCarData(carData);
    }
  }, [carData, setCarData]);

  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      resetCarState();
    };
  }, [resetCarState]);

  if (!carData) {
    return (
      <div className="w-full h-[50vh] grid place-items-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-6xl">🚗</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Car Not Found</h2>
          <p className="text-muted-foreground max-w-md">
            The car with VIN <span className="font-mono font-semibold">unknown</span> could not be found or is not available.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <div className="flex flex-col mb-4 mt-8 md:mt-4 px-4 sm:px-6 lg:px-8">
        <div className="w-full lg:w-3/4 mx-auto mb-8">
          <StatusLine status={carData.shippingStatus} />
        </div>
        <div className="mt-8 w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          <div className="h-full min-h-[500px] flex items-center justify-center">
            <FallbackImageGallery vin={carData.vin} />
          </div>
          <CarInfo car={carData} className="h-full min-h-[500px] flex flex-col" />
        </div>
      </div>
    </TooltipProvider>
  );
} 