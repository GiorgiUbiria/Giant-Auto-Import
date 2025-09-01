"use client";

import Image from "next/image";
import Bg from "../../public/new_bg.png";

export default function HeroImageComponent() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="relative w-full h-full">
        <Image
          src={Bg}
          alt="Maritime shipping background"
          fill
          className="object-cover"
          style={{
            objectPosition: 'center 20%', // Position to show more of the lower portion where cars are
            minHeight: '100%',
            minWidth: '100%',
            transform: 'scale(1)', // Prevent scaling issues on zoom
            transformOrigin: 'center center',
          }}
          priority
          quality={75}
          placeholder="blur"
          sizes="100vw"
          loading="eager"
        />
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      </div>
    </div>
  );
}
