"use client";

import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { useMemo } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/webp",
];
const MAX_IMAGE_SIZE = 4;

const sizeInMB = (sizeInBytes: number, decimalsNum = 2) => {
  const result = sizeInBytes / (1024 * 1024);
  return +result.toFixed(decimalsNum);
};

// Move validation schemas outside component to prevent recreation on every render
const createImageSchema = (fieldName: string) => z
  .custom<FileList>()
  .refine((files) => {
    return Array.from(files ?? []).every(
      (file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE
    );
  }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
  .refine((files) => {
    return Array.from(files ?? []).every((file) =>
      ACCEPTED_IMAGE_TYPES.includes(file.type)
    );
  }, "File type is not supported")
  .optional();

// Pre-create schemas for better performance
const ImageSchemas = {
  auction_images: createImageSchema("auction_images"),
  pick_up_images: createImageSchema("pick_up_images"),
  warehouse_images: createImageSchema("warehouse_images"),
  delivery_images: createImageSchema("delivery_images"),
};

interface ImageUploadSectionProps {
  form: UseFormReturn<any>;
}

export function ImageUploadSection({ form }: ImageUploadSectionProps) {
  // Memoize image types to prevent unnecessary re-renders
  const imageTypes = useMemo(() => [
    {
      name: "auction_images",
      label: "Auction Images",
      description: "Images from the auction"
    },
    {
      name: "pick_up_images",
      label: "Pick-up Images",
      description: "Images from pick-up"
    },
    {
      name: "warehouse_images",
      label: "Warehouse Images",
      description: "Images from warehouse"
    },
    {
      name: "delivery_images",
      label: "Delivery Images",
      description: "Images from delivery"
    }
  ], []);

  return (
    <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-md">
      <CardHeader className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <CardTitle>Images</CardTitle>
      </CardHeader>
      <CardContent className="bg-white dark:bg-gray-800 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {imageTypes.map((imageType) => (
            <FormField
              key={imageType.name}
              control={form.control}
              name={imageType.name}
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel className="text-gray-900 dark:text-gray-100 font-semibold">{imageType.label}</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept={ACCEPTED_IMAGE_TYPES.join(",")}
                      multiple
                      onChange={(e) => {
                        const files = e.target.files;
                        onChange(files);
                      }}
                      className="border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {imageType.description}. Max size: {MAX_IMAGE_SIZE}MB per file.
                  </p>
                </FormItem>
              )}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 