"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { handleUploadImagesAction } from "@/lib/actions/bucketActions";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useServerAction } from "zsa-react";

const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpg",
  "image/jpeg",
  "image/webp",
];
const MAX_IMAGE_SIZE = 4;

let prevPreviews: Record<string, string[]> = {};

const sizeInMB = (sizeInBytes: number, decimalsNum = 2) => {
  const result = sizeInBytes / (1024 * 1024);
  return +result.toFixed(decimalsNum);
};

const ImageSchema = z.object({
  auction_images: z
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
    .optional(),
  pick_up_images: z
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
    .optional(),
  warehouse_images: z
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
    .optional(),
  delivery_images: z
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
    .optional(),
});

export function ImagesForm({ vin }: { vin: string }) {
  const [isPending, setIsPending] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string[]>>({});
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof ImageSchema>>({
    resolver: zodResolver(ImageSchema),
    defaultValues: {},
  });

  const { execute: executeImageUpload } = useServerAction(handleUploadImagesAction, {
    onError: (err) => {
      console.error("Image upload error:", err);
      throw new Error("Failed to upload images");
    },
  });

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

    // Use the server action to handle the upload
    const result = await executeImageUpload({
      vin,
      images: imageData,
    });

    return result;
  };

  const onSubmit = async (values: z.infer<typeof ImageSchema>) => {
    try {
      const {
        warehouse_images,
        pick_up_images,
        auction_images,
        delivery_images,
      } = values;

      const imagePromises = [];
      
      if (warehouse_images && warehouse_images.length > 0) {
        imagePromises.push(processImages(warehouse_images, "WAREHOUSE", vin));
      }
      if (auction_images && auction_images.length > 0) {
        imagePromises.push(processImages(auction_images, "AUCTION", vin));
      }
      if (pick_up_images && pick_up_images.length > 0) {
        imagePromises.push(processImages(pick_up_images, "PICK_UP", vin));
      }
      if (delivery_images && delivery_images.length > 0) {
        imagePromises.push(processImages(delivery_images, "DELIVERED", vin));
      }

      setIsPending(true);
      
      if (imagePromises.length > 0) {
        await Promise.all(imagePromises);
      }
      
      setIsPending(false);

      queryClient.invalidateQueries({ queryKey: ["getImagesForCar", vin] });
      toast.success("Images Uploaded successfully");
    } catch (error) {
      console.error(error);
      setIsPending(false);
      toast.error("An error occurred while submitting the form");
    }
  };

  const handleSubmit = form.handleSubmit(onSubmit);

  // Generate previews when files are selected
  useEffect(() => {
    const fields = [
      "auction_images",
      "warehouse_images",
      "delivery_images",
      "pick_up_images",
    ];
    const updatePreviews = () => {
      const newPreviews: Record<string, string[]> = {};
      fields.forEach((field) => {
        const files = form.getValues(field as any) as FileList | undefined;
        if (files && files.length > 0) {
          newPreviews[field] = Array.from(files).map((file: File) => URL.createObjectURL(file));
        } else {
          newPreviews[field] = [];
        }
      });
      // Revoke old URLs
      Object.values(prevPreviews).flat().forEach((url) => URL.revokeObjectURL(url));
      prevPreviews = newPreviews;
      setPreviews(newPreviews);
    };
    updatePreviews();
    const subscription = form.watch(() => {
      updatePreviews();
    });
    return () => {
      subscription.unsubscribe();
      Object.values(prevPreviews).flat().forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-6 my-12 md:my-4 bg-gray-200/90 dark:bg-gray-700 p-3 rounded-md"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          <FormField
            control={form.control}
            name="auction_images"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Auction Images</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    {...fieldProps}
                    multiple
                    accept={ACCEPTED_IMAGE_TYPES.join(", ")}
                    onChange={(event) => onChange(event.target.files)}
                  />
                </FormControl>
                <FormDescription>Auction Images</FormDescription>
                {/* Image Previews */}
                {previews.auction_images && previews.auction_images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previews.auction_images.map((url, idx) => (
                      <img
                        key={url}
                        src={url}
                        alt={`Auction Preview ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded border"
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="warehouse_images"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Warehouse Images</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    {...fieldProps}
                    multiple
                    accept={ACCEPTED_IMAGE_TYPES.join(", ")}
                    onChange={(event) => onChange(event.target.files)}
                  />
                </FormControl>
                <FormDescription>Warehouse Images</FormDescription>
                {/* Image Previews */}
                {previews.warehouse_images && previews.warehouse_images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previews.warehouse_images.map((url, idx) => (
                      <img
                        key={url}
                        src={url}
                        alt={`Warehouse Preview ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded border"
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="delivery_images"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Delivery Images</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    {...fieldProps}
                    multiple
                    accept={ACCEPTED_IMAGE_TYPES.join(", ")}
                    onChange={(event) => onChange(event.target.files)}
                  />
                </FormControl>
                <FormDescription>Delivery Images</FormDescription>
                {/* Image Previews */}
                {previews.delivery_images && previews.delivery_images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previews.delivery_images.map((url, idx) => (
                      <img
                        key={url}
                        src={url}
                        alt={`Delivery Preview ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded border"
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pick_up_images"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Pick Up Images</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    {...fieldProps}
                    multiple
                    accept={ACCEPTED_IMAGE_TYPES.join(", ")}
                    onChange={(event) => onChange(event.target.files)}
                  />
                </FormControl>
                <FormDescription>Pick Up Images</FormDescription>
                {/* Image Previews */}
                {previews.pick_up_images && previews.pick_up_images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previews.pick_up_images.map((url, idx) => (
                      <img
                        key={url}
                        src={url}
                        alt={`Pick Up Preview ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded border"
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" /> : "Upload Images"}
        </Button>
      </form>
    </Form>
  );
}