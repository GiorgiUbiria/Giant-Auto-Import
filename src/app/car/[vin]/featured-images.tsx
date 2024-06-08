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
    console.log("Current Image Type:", imageType);
    console.log("All Images:", car.images);
    const filteredImages = car?.images?.filter(
      (image) => image.imageType === imageType,
    );
    console.log("Filtered Images:", filteredImages);
    setImages(filteredImages);
  }, [imageType, car.images]);

  return (
    <div className="lg:basis-1/2 flex justify-center">
      <CustomMenuBar
        options={["Arrival", "Container"]}
        onSelect={handleImageTypeChange}
      />

      <FeaturedImageGallery data={images ? images : []} />
    </div>
  );
}
