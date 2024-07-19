"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

import HeroImage from "../../public/hero-image.png";
import HeroBackgroundImage from "../../public/background2.png";

export default function HeroImageComponent() {
  const [currentImage, setCurrentImage] = useState(HeroImage);
  const [animating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsAnimating(true);
    }, 0)
    
    const interval = setInterval(() => {
      setIsAnimating(true);
      setCurrentImage((prevImage) =>
        prevImage === HeroImage ? HeroBackgroundImage : HeroImage,
      );
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(timeout);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src={currentImage}
        alt="Background Image"
        layout="fill"
        objectFit="cover"
        objectPosition="center"
        className={`${animating ? "animate-zoomIn" : ""}`}
        priority
      />
      <div className="absolute inset-0 bg-black opacity-50"></div>
    </div>
  );
}
