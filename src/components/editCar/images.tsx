"use client";

import { useFormState, useFormStatus } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { editCarInDb } from "@/lib/actions/actions.editCar";
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
import { deleteImage } from "@/lib/actions/imageActions";
import { handleUploadImages } from "@/lib/actions/bucketActions";
import Spinner from "../spinner";
import { useRouter } from "next/navigation";

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpg", "image/jpeg"];
const MAX_IMAGE_SIZE = 4;

const sizeInMB = (sizeInBytes: number, decimalsNum = 2) => {
  const result = sizeInBytes / (1024 * 1024);
  return +result.toFixed(decimalsNum);
};

const initialState = {
  error: null,
  success: undefined,
};

const formSchema = z.object({
  arrived_images: z
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
  container_images: z
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
  const [state, formAction] = useFormState(editCarInDb, initialState);
  const { pending } = useFormStatus();
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

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log("Submitting form data:", data);
    const { arrived_images, container_images } = data;
    const processAndUploadImages = async (
      images: FileList | undefined,
      type: string,
      vin: string,
    ) => {
      if (!images || images.length === 0) return;

      const fileData = await Promise.all(
        Array.from(images).map(async (file: File) => {
          const arrayBuffer = await file.arrayBuffer();
          return {
            buffer: new Uint8Array(arrayBuffer),
            size: file.size,
            type: file.type,
            name: file.name,
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
      await processAndUploadImages(container_images, "Container", vin);
      await processAndUploadImages(arrived_images, "Arrived", vin);
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 mb-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="images"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Arrived Images
            </label>
            <input
              type="file"
              id="arrived_images"
              multiple
              {...register("arrived_images", {
                setValueAs: (v) => Array.from(v),
              })}
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            />
            <ErrorMessage
              errors={formState.errors}
              name="arrived_images"
              render={({ message }) => (
                <p className="text-red-500 text-sm">{message}</p>
              )}
            />
          </div>
          <div>
            <label
              htmlFor="container_images"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Container Images
            </label>
            <input
              type="file"
              id="container_images"
              multiple
              {...register("container_images", {
                setValueAs: (v) => Array.from(v),
              })}
              className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-gray-900 rounded-lg border-1 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            />
            <ErrorMessage
              errors={formState.errors}
              name="container_images"
              render={({ message }) => (
                <p className="text-red-500 text-sm">{message}</p>
              )}
            />
          </div>
        </div>
        <div className="grid gap-6 mb-6 md:grid-cols1-1">
          <button
            disabled={pending}
            type="submit"
            className="w-full py-2.5 px-5 me-2 mb-2 text-sm font-medium text-black focus:outline-none bg-gray-300 rounded-lg border border-gray-200 hover:bg-gray-900-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-900-800 dark:text-gray-900 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-900-700"
          >
            {pending ? <Spinner /> : "Upload Images"}
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
                    <DialogTrigger>
                      <Image
                        className="h-auto max-w-full rounded-lg"
                        src={image.imageUrl!}
                        alt={`Car image ${imgIndex + 1}`}
                        width={300}
                        height={300}
                      />
                    </DialogTrigger>
                    <DialogContent className="min-w-full md:min-w-fit">
                      <div className="flex flex-col gap-4">
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
                          width={550}
                          height={400}
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
