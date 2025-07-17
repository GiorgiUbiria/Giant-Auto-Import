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
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useServerAction } from "zsa-react";
import imageCompression from "browser-image-compression";

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

  const { execute: executeImageUpload } = useServerAction(handleUploadImagesAction, {
    onError: (err) => {
      console.error("Image upload error:", err);
      throw new Error("Failed to upload images");
    },
  });

  // Compression options
  const options = {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.6,
  };

  // Helper: create a thumbnail using browser-image-compression
  async function createThumbnail(file: File): Promise<File> {
    return imageCompression(file, {
      maxWidthOrHeight: 300,
      maxSizeMB: 0.1,
      initialQuality: 0.4,
      fileType: 'image/webp',
      useWebWorker: true,
    });
  }

  // Helper: upload all images with proper progress tracking
  async function uploadAllImages(allFiles: Array<{ file: File; type: "AUCTION" | "WAREHOUSE" | "DELIVERED" | "PICK_UP" }>) {
    let uploaded = 0;
    setUploadProgress({ total: allFiles.length, uploaded: 0 });

    for (const { file, type } of allFiles) {
      try {
        let compressedFile: File = file;
        try {
          compressedFile = await imageCompression(file, options);
        } catch (err) {
          console.warn("Compression failed, using original file:", err);
          compressedFile = file;
        }

        // Generate thumbnail
        let thumbFile: File | null = null;
        try {
          thumbFile = await createThumbnail(file);
        } catch (err) {
          console.warn("Thumbnail generation failed, skipping thumbnail:", err);
        }

        // Upload original
        const arrayBuffer = await compressedFile.arrayBuffer();
        await executeImageUpload({
          vin,
          images: [
            {
              buffer: Array.from(new Uint8Array(arrayBuffer)),
              size: compressedFile.size,
              name: compressedFile.name,
              type: type,
            },
          ],
        });

        // Upload thumbnail (with -thumb before extension)
        if (thumbFile) {
          const extIdx = compressedFile.name.lastIndexOf('.');
          const thumbName = extIdx !== -1
            ? compressedFile.name.slice(0, extIdx) + '-thumb.webp'
            : compressedFile.name + '-thumb.webp';
          const thumbBuffer = await thumbFile.arrayBuffer();
          await executeImageUpload({
            vin,
            images: [
              {
                buffer: Array.from(new Uint8Array(thumbBuffer)),
                size: thumbFile.size,
                name: thumbName,
                type: type,
              },
            ],
          });
        }

        uploaded++;
        setUploadProgress({ total: allFiles.length, uploaded });
        console.log(`Uploaded ${uploaded}/${allFiles.length}: ${compressedFile.name}`);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        // Continue with next file instead of stopping
        uploaded++;
        setUploadProgress({ total: allFiles.length, uploaded });
      }
    }
  }

  const processImages = async (
    images: FileList | undefined,
    type: "AUCTION" | "WAREHOUSE" | "DELIVERED" | "PICK_UP",
    vin: string
  ) => {
    if (!images || images.length === 0) return;

    // Compression options: target ~1.5MB per image, 10-15x compression
    const options = {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.6, // start with moderate quality
    };

    const imageData = await Promise.all(
      Array.from(images).map(async (file: File) => {
        let compressedFile = file;
        try {
          compressedFile = await imageCompression(file, options);
        } catch (err) {
          // fallback to original file if compression fails
          compressedFile = file;
        }
        const arrayBuffer = await compressedFile.arrayBuffer();
        return {
          buffer: Array.from(new Uint8Array(arrayBuffer)),
          size: compressedFile.size,
          name: compressedFile.name,
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

      // Gather all files with their types
      const allFiles: Array<{ file: File; type: "AUCTION" | "WAREHOUSE" | "DELIVERED" | "PICK_UP" }> = [];
      
      if (warehouse_images) {
        Array.from(warehouse_images).forEach(file => {
          allFiles.push({ file, type: "WAREHOUSE" as const });
        });
      }
      if (auction_images) {
        Array.from(auction_images).forEach(file => {
          allFiles.push({ file, type: "AUCTION" as const });
        });
      }
      if (pick_up_images) {
        Array.from(pick_up_images).forEach(file => {
          allFiles.push({ file, type: "PICK_UP" as const });
        });
      }
      if (delivery_images) {
        Array.from(delivery_images).forEach(file => {
          allFiles.push({ file, type: "DELIVERED" as const });
        });
      }

      if (allFiles.length === 0) {
        toast.error("No images selected");
        return;
      }

      setIsPending(true);
      await uploadAllImages(allFiles);
      setIsPending(false);
      setUploadProgress({ total: 0, uploaded: 0 });
      
      queryClient.invalidateQueries({ queryKey: ["getImagesForCar", vin] });
      toast.success(`Successfully uploaded ${allFiles.length} images`);
    } catch (error) {
      console.error("Upload error:", error);
      setIsPending(false);
      setUploadProgress({ total: 0, uploaded: 0 });
      toast.error("An error occurred while uploading images");
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
        {/* Upload Progress Bar */}
        {uploadProgress.total > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Uploaded {uploadProgress.uploaded} of {uploadProgress.total}</span>
              <span>{uploadProgress.total - uploadProgress.uploaded} left</span>
            </div>
            <progress
              className="w-full h-2"
              value={uploadProgress.total === 0 ? 0 : (uploadProgress.uploaded / uploadProgress.total) * 100}
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