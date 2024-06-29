"use client";

import { Image as ImageType } from "@/lib/interfaces";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

export default function Images({ images }: { images: ImageType[] }) {
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
                <DialogContent className="min-w-full">
                  <Image
                    className="h-auto min-w-full max-w-full rounded-lg"
                    src={image.imageUrl!}
                    alt={`Car image ${imgIndex + 1}`}
                    width={800}
                    height={800}
                  />
                </DialogContent>
              </Dialog>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
