"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Image as ImageType } from "@/lib/interfaces";

export function FeaturedImageGallery({ data }: { data: ImageType[] }) {
  const [active, setActive] = React.useState(data.at(0)?.imageUrl);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  };

  const closeDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  };

  const handleShowAll = () => {
    openDialog();
  };

  if (data.length === 0) {
    return (
      <div className="w-[480px]">
        <div className="grid gap-4">
          <div className="flex flex-col items-center justify-center h-[480px] w-full max-w-full rounded-lg bg-gray-200">
            <p className="text-gray-600">No images found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="grid gap-4">
        <div>
          <Image
            className="h-auto w-full max-w-full rounded-lg object-cover object-center md:h-[480px]"
            src={active!}
            alt="car"
            onClick={openDialog}
            width="400"
            height="400"
          />
        </div>
        <div className="grid grid-cols-5 gap-4">
          {data.slice(0, 4).map(({ imageUrl }, index) => (
            <div key={index}>
              <Image
                onClick={() => setActive(imageUrl)}
                src={imageUrl!}
                width="100"
                height="100"
                className="h-20 max-w-full cursor-pointer rounded-lg object-cover object-center"
                alt="gallery-image"
              />
            </div>
          ))}
          {data.length > 4 && (
            <button
              onClick={handleShowAll}
              className="h-20 flex items-center justify-center rounded-lg border border-dashed border-gray-400 text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              Show All
            </button>
          )}
        </div>
        <dialog
          ref={dialogRef}
          className="relative w-3/4 max-w-4xl p-0 bg-transparent"
        >
          <div className="bg-white p-4 rounded-lg max-w-4xl w-full">
            <button
              onClick={closeDialog}
              className="absolute top-2 right-4 text-white text-4xl hover:text-red-500"
            >
              &times;
            </button>
            <div className="flex overflow-x-scroll space-x-4">
              {data.map(({ imageUrl }, index) => (
                <Image
                  key={index}
                  src={imageUrl!}
                  width="400"
                  height="400"
                  className="h-80 object-cover rounded-lg"
                  alt="carousel-image"
                />
              ))}
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
}
