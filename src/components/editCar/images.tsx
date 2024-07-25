"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { Image as ImageType } from "@/lib/interfaces";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";
import { toast } from "sonner";
import { deleteImage, makeMain } from "@/lib/actions/imageActions";
import { handleUploadImages } from "@/lib/actions/bucketActions";
import Spinner from "../spinner";
import { useRouter } from "next/navigation";
import Compressor from "compressorjs";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpg", "image/jpeg"];
const MAX_IMAGE_SIZE = 4;

const sizeInMB = (sizeInBytes: number, decimalsNum = 2) => {
  const result = sizeInBytes / (1024 * 1024);
  return +result.toFixed(decimalsNum);
};

const formSchema = z.object({
  auction_images: z
    .custom<FileList>()
    .refine((files) => {
      return Array.from(files ?? []).every(
        (file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE,
      );
    }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
    .refine((files) => {
      return Array.from(files ?? []).every((file) =>
        ACCEPTED_IMAGE_TYPES.includes(file.type),
      );
    }, "File type is not supported")
    .optional(),
  pick_up_images: z
    .custom<FileList>()
    .refine((files) => {
      return Array.from(files ?? []).every(
        (file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE,
      );
    }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
    .refine((files) => {
      return Array.from(files ?? []).every((file) =>
        ACCEPTED_IMAGE_TYPES.includes(file.type),
      );
    }, "File type is not supported")
    .optional(),
  warehouse_images: z
    .custom<FileList>()
    .refine((files) => {
      return Array.from(files ?? []).every(
        (file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE,
      );
    }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
    .refine((files) => {
      return Array.from(files ?? []).every((file) =>
        ACCEPTED_IMAGE_TYPES.includes(file.type),
      );
    }, "File type is not supported")
    .optional(),
  delivery_images: z
    .custom<FileList>()
    .refine((files) => {
      return Array.from(files ?? []).every(
        (file) => sizeInMB(file.size) <= MAX_IMAGE_SIZE,
      );
    }, `The maximum image size is ${MAX_IMAGE_SIZE}MB`)
    .refine((files) => {
      return Array.from(files ?? []).every((file) =>
        ACCEPTED_IMAGE_TYPES.includes(file.type),
      );
    }, "File type is not supported")
    .optional(),
});

export type FormValues = z.infer<typeof formSchema>;

export default function Images({
  images,
  vin,
}: {
  images: ImageType[] | undefined;
  vin: string;
}) {
  const router = useRouter();
  const [loading, setTransitioning] = React.useTransition();
  const { handleSubmit, register, formState } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const chunkArray = (arr: ImageType[], chunkSize: number) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
  };
  let imageChunks: ImageType[][] = [];
  if (images && images.length > 0) {
    imageChunks = chunkArray(images, 3);
  }

  async function deleteImageCall(imageUrl: string) {
    setTransitioning(async () => {
      const res = await deleteImage(imageUrl);
      if (res.error !== null) {
        toast.error(res.error);
        console.error(res.error);
      } else {
        toast.success(res.success);
        console.log(res.success);
      }
    });
  }

  const imageTypes = [
    "auction_images",
    "pick_up_images",
    "warehouse_images",
    "delivery_images",
  ] as const;

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const {
      auction_images,
      pick_up_images,
      warehouse_images,
      delivery_images,
    } = data;
    const processAndUploadImages = async (
      images: FileList | undefined,
      type: string,
      vin: string,
    ) => {
      if (!images || images.length === 0) return;

      const fileData = await Promise.all(
        Array.from(images).map(async (file: File) => {
          const compressedFilePromise = new Promise<File | Blob>(
            (resolve, reject) => {
              new Compressor(file, {
                quality: 0.6,
                success(result) {
                  resolve(result);
                },
                error(err) {
                  reject(err);
                },
              });
            },
          );
          const compressedFile = (await compressedFilePromise) as File;
          const compressedArrayBuffer = await compressedFile.arrayBuffer();
          return {
            buffer: new Uint8Array(compressedArrayBuffer),
            size: file.size,
            type: file.type,
            name: file.name.replace(/\.[^/.]+$/, ".webp"),
          };
        }),
      );

      const urls = await handleUploadImages(
        type,
        vin,
        fileData.map((file) => file.size),
      );

      const res = await Promise.all(
        urls.map((url: string, index: number) =>
          fetch(url, {
            method: "PUT",
            headers: {
              "Content-Type": images[index].type,
            },
            body: fileData[index].buffer,
          }),
        ),
      );

      if (res.some((r) => r.status !== 200)) {
        toast.error("Failed to upload images");
        console.error("Failed to upload images");
      } else {
        toast.success("Images uploaded successfully");
        router.refresh();
        console.log("Images uploaded successfully");
      }
    };

    setTransitioning(async () => {
      await processAndUploadImages(auction_images, "AUCTION", vin);
      await processAndUploadImages(pick_up_images, "PICK_UP", vin);
      await processAndUploadImages(warehouse_images, "WAREHOUSE", vin);
      await processAndUploadImages(delivery_images, "DELIVERY", vin);
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 mb-6 md:grid-cols-4">
          {imageTypes.map((type) => (
            <div key={type}>
              <label
                htmlFor={type}
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                {type.replace("_", " ").toUpperCase()} Photos
              </label>
              <input
                type="file"
                id={type}
                multiple
                {...register(type, {
                  setValueAs: (v) => Array.from(v),
                })}
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 dark:text-white bg-gray-300 dark:bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
              />
              <ErrorMessage
                errors={formState.errors}
                name={type}
                render={({ message }) => (
                  <p className="text-red-500 text-sm">{message}</p>
                )}
              />
            </div>
          ))}
        </div>
        <div className="grid gap-6 mb-6 md:grid-cols1-1">
          <button
            disabled={loading}
            type="submit"
            className="w-full py-2.5 px-5 me-2 mb-2 text-sm font-medium text-black focus:outline-none bg-gray-300 rounded-lg border border-gray-200 hover:bg-gray-900-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-900-800 dark:text-gray-900 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-900-700"
          >
            {loading ? <Spinner /> : "Upload Images"}
          </button>
        </div>
      </form>
      {images !== undefined && imageChunks.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {imageChunks.map((chunk, index) => (
            <div key={index} className="grid gap-4">
              {chunk.map((image: ImageType, imgIndex: number) => (
                <div key={imgIndex}>
                  <Dialog>
                    <DialogTrigger asChild>
                      <div>
                        <Image
                          className="h-auto max-w-full rounded-lg"
                          src={image.imageUrl!}
                          alt={`Car image ${imgIndex + 1}`}
                          width={300}
                          height={300}
                          placeholder="blur"
                          blurDataURL="../../../public/placeholder.webp"
                          priority
                        />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="min-w-full md:min-w-fit">
                      <div className="flex flex-col gap-4 p-4">
                        <Button onClick={
                          async () => await makeMain(image.imageKey!, vin)
                        }> Make main </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline">Delete Image</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Image</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this image?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel asChild>
                                <Button variant="outline">Cancel</Button>
                              </AlertDialogCancel>
                              <AlertDialogAction asChild>
                                <Button
                                  variant="destructive"
                                  onClick={async () =>
                                    await deleteImageCall(image.imageUrl!)
                                  }
                                >
                                  Delete
                                </Button>
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Image
                          className="h-auto min-w-full max-w-full rounded-lg"
                          src={image.imageUrl!}
                          alt={`Car image ${imgIndex + 1}`}
                          width={350}
                          height={200}
                          placeholder="blur"
                          blurDataURL="../../../public/placeholder.webp"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p> No Images </p>
      )}
    </div>
  );
}
