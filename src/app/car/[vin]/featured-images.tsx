"use client";

import { FeaturedImageGallery } from "@/components/image-gallery";
import { CarData } from "@/lib/interfaces";
import React, { useEffect, useState } from "react";
import CustomMenuBar from "./custom-menubar";
import { Image } from "@/lib/interfaces";

export default function Gallery({ car }: { car: CarData }) {
  const [imageType, setImageType] = useState("Arrival");
  const [images, setImages] = useState<Image[] | undefined>(car.images);

  const handleImageTypeChange = (imageType: string) => {
    setImageType(imageType);
  };

  useEffect(() => {
    const filteredImages = car?.images?.filter(
      (image) => image.imageType === imageType,
    );

    setImages(filteredImages);
  }, [imageType, car.images]);

  return (
    <div className="lg:basis-1/2 flex flex-col justify-center place-items-center">
      <CustomMenuBar
        onSelect={handleImageTypeChange}
      />
      <FeaturedImageGallery data={images ? images : []} />
    </div>
  );
}
