"use client";

import Image from "next/image";
import Bg from "../../public/bg.avif";

export default function HeroImageComponent() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="relative w-full h-full">
        <Image
          src={Bg}
          alt="Maritime shipping background"
          fill
          className="object-cover object-center"
          priority
          quality={75}
          placeholder="blur"
          sizes="100vw"
          loading="eager"
        />
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
    </div>
  );
}
