"use client";

import Image from "next/image";
import { Carousel, Modal } from "flowbite-react";

import { Image as ImageType } from "@/lib/interfaces";
import { useState } from "react";

export function FeaturedImageGallery({ data }: { data: ImageType[] }) {
  const [openModal, setOpenModal] = useState(false);

  if (data.length === 0) {
    return (
      <div className="w-full">
        <div className="grid gap-4">
          <div className="flex flex-col items-center justify-center h-[640px] w-full max-w-full rounded-lg bg-gray-200">
            <p className="text-gray-600">No images found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sm:h-64 md:h-[640px]">
      <Carousel slide={false} indicators={false}>
        {data.map((image) => (
          <Image
            key={image.imageUrl}
            src={image.imageUrl!}
            alt={"Image"}
            width="500"
            height="500"
            onClick={() => setOpenModal(true)}
          />
        ))}
      </Carousel>
      <Modal show={openModal} onClose={() => setOpenModal(false)} size="7xl">
        <Modal.Header></Modal.Header>
        <Modal.Body>
            <Image
              key={data.at(0)!.imageUrl}
              src={data.at(0)!.imageUrl!}
              className="w-full h-auto object-cover"
              alt={"Image"}
              width="500"
              height="500"
            />
        </Modal.Body>
        <Modal.Footer></Modal.Footer>
      </Modal>
    </div>
  );
}
