"use client";

import { Image as ImageType } from "@/lib/interfaces";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";
import { toast } from "sonner";

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

  async function deleteImage(imageUrl: string) {
    setTransitioning(async () => {
      const res = await ();
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
                    <Button className="w-full" onClick={() => deleteImage(image.imageUrl!)}>
                      Delete Image
                    </Button>
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
