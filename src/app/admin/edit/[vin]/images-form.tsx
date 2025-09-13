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
import { showUploadResult, uploadImagesWithProgress } from "@/lib/utils/imageUpload";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
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
      return Array.from(files ?? []).every((file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE);
    }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
    .refine((files) => {
      return Array.from(files ?? []).every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type));
    }, "File type is not supported")
    .optional(),
  pick_up_images: z
    .custom<FileList>()
    .refine((files) => {
      return Array.from(files ?? []).every((file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE);
    }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
    .refine((files) => {
      return Array.from(files ?? []).every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type));
    }, "File type is not supported")
    .optional(),
  warehouse_images: z
    .custom<FileList>()
    .refine((files) => {
      return Array.from(files ?? []).every((file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE);
    }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
    .refine((files) => {
      return Array.from(files ?? []).every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type));
    }, "File type is not supported")
    .optional(),
  delivery_images: z
    .custom<FileList>()
    .refine((files) => {
      return Array.from(files ?? []).every((file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE);
    }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
    .refine((files) => {
      return Array.from(files ?? []).every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type));
    }, "File type is not supported")
    .optional(),
});

export function ImagesForm({ vin }: { vin: string }) {
  const [isPending, setIsPending] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string[]>>({});
  const [uploadProgress, setUploadProgress] = useState({ total: 0, uploaded: 0 });
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof ImageSchema>>({
    resolver: zodResolver(ImageSchema),
    defaultValues: {},
  });
  // Refs for file inputs
  const auctionInputRef = useRef<HTMLInputElement>(null);
  const warehouseInputRef = useRef<HTMLInputElement>(null);
  const deliveryInputRef = useRef<HTMLInputElement>(null);
  const pickupInputRef = useRef<HTMLInputElement>(null);

  // Helper: prepare image files for upload
  function prepareImageFiles(values: z.infer<typeof ImageSchema>) {
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

  const onSubmit = async (values: z.infer<typeof ImageSchema>) => {
    try {
      const imageFiles = prepareImageFiles(values);

      // Check if there are any images to upload
      const hasImages = Object.values(imageFiles).some((files) => files && files.length > 0);
      if (!hasImages) {
        toast.error("No images selected");
        return;
      }

      setIsPending(true);
      setUploadProgress({ total: 0, uploaded: 0 });

      const result = await uploadImagesWithProgress(vin, imageFiles, (uploaded, total) => {
        setUploadProgress({ total, uploaded });
      });

      // Show results using standardized display
      showUploadResult(result);

      // Invalidate queries to refresh the image list
      queryClient.invalidateQueries({ queryKey: ["getImagesForCar", vin] });

      // Reset form if upload was successful
      if (result.success) {
        form.reset();
        // Clear file inputs
        [auctionInputRef, warehouseInputRef, deliveryInputRef, pickupInputRef].forEach((ref) => {
          if (ref.current) ref.current.value = "";
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred while uploading images");
    } finally {
      setIsPending(false);
      setUploadProgress({ total: 0, uploaded: 0 });
    }
  };

  const handleSubmit = form.handleSubmit(onSubmit);

  // Generate previews when files are selected
  useEffect(() => {
    const fields = ["auction_images", "warehouse_images", "delivery_images", "pick_up_images"];
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
      Object.values(prevPreviews)
        .flat()
        .forEach((url) => URL.revokeObjectURL(url));
      prevPreviews = newPreviews;
      setPreviews(newPreviews);
    };
    updatePreviews();
    const subscription = form.watch(() => {
      updatePreviews();
    });
    return () => {
      subscription.unsubscribe();
      Object.values(prevPreviews)
        .flat()
        .forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-6 my-12 md:my-4 bg-gray-200/90 dark:bg-gray-700 p-3 rounded-md"
      >
        {/* Upload Progress Bar */}
        {uploadProgress.total > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>
                Uploaded {uploadProgress.uploaded} of {uploadProgress.total}
              </span>
              <span>{uploadProgress.total - uploadProgress.uploaded} left</span>
            </div>
            <progress
              className="w-full h-2"
              value={
                uploadProgress.total === 0
                  ? 0
                  : (uploadProgress.uploaded / uploadProgress.total) * 100
              }
              max={100}
            />
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          <FormField
            control={form.control}
            name="auction_images"
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Auction Images</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      {...fieldProps}
                      multiple
                      accept={ACCEPTED_IMAGE_TYPES.join(", ")}
                      onChange={(event) => onChange(event.target.files)}
                      ref={auctionInputRef}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        form.setValue("auction_images", undefined);
                        if (auctionInputRef.current) auctionInputRef.current.value = "";
                      }}
                      disabled={isPending}
                    >
                      Clear
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>Auction Images</FormDescription>
                {/* Image Previews */}
                {previews.auction_images && previews.auction_images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previews.auction_images.map((url, idx) => (
                      <Image
                        key={url}
                        src={url}
                        alt={`Auction Preview ${idx + 1}`}
                        width={80}
                        height={80}
                        className="object-cover rounded border"
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
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      {...fieldProps}
                      multiple
                      accept={ACCEPTED_IMAGE_TYPES.join(", ")}
                      onChange={(event) => onChange(event.target.files)}
                      ref={warehouseInputRef}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        form.setValue("warehouse_images", undefined);
                        if (warehouseInputRef.current) warehouseInputRef.current.value = "";
                      }}
                      disabled={isPending}
                    >
                      Clear
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>Warehouse Images</FormDescription>
                {/* Image Previews */}
                {previews.warehouse_images && previews.warehouse_images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previews.warehouse_images.map((url, idx) => (
                      <Image
                        key={url}
                        src={url}
                        alt={`Warehouse Preview ${idx + 1}`}
                        width={80}
                        height={80}
                        className="object-cover rounded border"
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
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      {...fieldProps}
                      multiple
                      accept={ACCEPTED_IMAGE_TYPES.join(", ")}
                      onChange={(event) => onChange(event.target.files)}
                      ref={deliveryInputRef}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        form.setValue("delivery_images", undefined);
                        if (deliveryInputRef.current) deliveryInputRef.current.value = "";
                      }}
                      disabled={isPending}
                    >
                      Clear
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>Delivery Images</FormDescription>
                {/* Image Previews */}
                {previews.delivery_images && previews.delivery_images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previews.delivery_images.map((url, idx) => (
                      <Image
                        key={url}
                        src={url}
                        alt={`Delivery Preview ${idx + 1}`}
                        width={80}
                        height={80}
                        className="object-cover rounded border"
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
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      {...fieldProps}
                      multiple
                      accept={ACCEPTED_IMAGE_TYPES.join(", ")}
                      onChange={(event) => onChange(event.target.files)}
                      ref={pickupInputRef}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        form.setValue("pick_up_images", undefined);
                        if (pickupInputRef.current) pickupInputRef.current.value = "";
                      }}
                      disabled={isPending}
                    >
                      Clear
                    </Button>
                  </div>
                </FormControl>
                <FormDescription>Pick Up Images</FormDescription>
                {/* Image Previews */}
                {previews.pick_up_images && previews.pick_up_images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {previews.pick_up_images.map((url, idx) => (
                      <Image
                        key={url}
                        src={url}
                        alt={`Pick Up Preview ${idx + 1}`}
                        width={80}
                        height={80}
                        className="object-cover rounded border"
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
