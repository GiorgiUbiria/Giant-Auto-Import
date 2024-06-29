"use client";

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

export default function Images({ images }: { images: ImageType[] }) {
  const [loading, setTransitioning] = React.useTransition();
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

  return (
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
  );
}
