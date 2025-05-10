import Image from "next/image";

import Bg from "../../public/bg.avif"

export default function HeroImageComponent() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src={Bg}
        alt="Background Image"
        fill
        className="object-cover object-center transform scale-105"
        priority
        quality={75}
        placeholder="blur"
        sizes="100vw"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 backdrop-blur-[2px]"></div>
    </div>
  );
}
