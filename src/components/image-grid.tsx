"use client";

import React, { useState } from "react";
import Image from "next/image";

interface Image {
  src: string;
  alt?: string;
}

const ImageGallery: React.FC<{ images: Image[] }> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);

  const openModal = (image: Image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="container mx-auto px-6 py-4">
      <h2 className="text-4xl font-bold text-center mb-8">
        Car Service Gallery
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Image
            key={image.src}
            onClick={() => openModal(image)}
            className="w-full h-64 object-cover cursor-pointer"
            src={image.src}
            alt={image.alt!}
            width="200"
            height="200"
          />
        ))}
      </div>
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-md w-full">
            <Image
              key={selectedImage.src}
              className="w-full"
              src={selectedImage.src}
              alt={selectedImage.alt!}
              width="200"
              height="200"
            />
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
