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
            objectPosition: 'center center',
            minHeight: '100%',
            minWidth: '100%',
          }}
          priority
          quality={75}
          placeholder="blur"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          loading="eager"
        />
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/50 sm:from-black/20 sm:via-transparent sm:to-black/40" />
      </div>
    </div>
  );
}
