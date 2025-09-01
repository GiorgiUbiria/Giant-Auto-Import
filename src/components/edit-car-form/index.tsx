"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { updateCarAction } from "@/lib/actions/carActions";
import { insertCarSchema, selectCarSchema } from "@/lib/drizzle/schema";
import { useServerActionMutation } from "@/lib/hooks/server-action-hooks";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BasicInfoSection } from "../shared-form-sections/basic-info-section";
import { AuctionInfoSection } from "../shared-form-sections/auction-info-section";
import { FinancialInfoSection } from "../shared-form-sections/financial-info-section";
import { useCacheInvalidation } from "@/lib/services/cache-invalidation-service";

import { ButtonWithLoading } from "@/components/ui/loading-components";

const FormSchema = insertCarSchema.omit({
  id: true,
  auctionFee: true,
  gateFee: true,
  titleFee: true,
  environmentalFee: true,
  virtualBidFee: true,
  groundFee: true,
  oceanFee: true,
  totalFee: true,
  shippingFee: true,
  destinationPort: true
});
const CarSchema = selectCarSchema.omit({ destinationPort: true });
type Car = z.infer<typeof CarSchema>;

interface EditCarFormProps {
  car: Car;
}

export function EditCarForm({ car }: EditCarFormProps) {
  const queryClient = useQueryClient();
  const { invalidateOnCarChange } = useCacheInvalidation();

  // Note: Using isPending from useServerActionMutation directly
  // instead of useServerActionLoading to avoid coordination issues

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      vin: car.vin,
      year: car.year,
      make: car.make,
      model: car.model,
      auction: car.auction,
      originPort: car.originPort,
      keys: car.keys,
      auctionLocation: car.auctionLocation,
      title: car.title,
      shippingStatus: car.shippingStatus,
      bodyType: car.bodyType,
      fuelType: car.fuelType,
      bookingNumber: car.bookingNumber,
      containerNumber: car.containerNumber,
      lotNumber: car.lotNumber,
      trackingLink: car.trackingLink,
      purchaseFee: car.purchaseFee,
      departureDate: car.departureDate,
      arrivalDate: car.arrivalDate,
      purchaseDate: car.purchaseDate,
      ownerId: car.ownerId,
      insurance: car.insurance,
    },
  });

  // Handle numeric input focus to clear the field when starting to type
  const handleNumericInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const input = e.target;
    if (input.value === "0") {
      input.value = "";
    }
  };

  const { isPending, mutate } = useServerActionMutation(updateCarAction, {
    onError: (error) => {
      const errorMessage = error?.data || "Failed to update the car";
      toast.error(errorMessage);
    },
    onSuccess: async ({ data }) => {
      const successMessage = data?.message || "Car updated successfully!";
      toast.success(successMessage);

      // Use smart cache invalidation based on car changes
      await invalidateOnCarChange({
        vin: car.vin,
        ownerId: car.ownerId,
        changeType: 'update'
      }, { refetch: true, activeOnly: true });
    },
  });

  const onSubmit = (values: z.infer<typeof FormSchema>) => {
    mutate(values);
  };

  return (
    <div className="w-full flex justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full md:w-2/3 space-y-8 my-8 bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all">
          <BasicInfoSection form={form} />
          <AuctionInfoSection form={form} />
          <FinancialInfoSection form={form} />

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              <ButtonWithLoading
                loading={isPending}
                loadingText="Updating Car..."
                size="md"
              >
                Update Car
              </ButtonWithLoading>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 