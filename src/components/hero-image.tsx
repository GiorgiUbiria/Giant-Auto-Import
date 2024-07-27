import Image from "next/image";

import Bg from "../../public/bg.avif"

export default function HeroImageComponent() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src={Bg}
        alt="Background Image"
        objectFit="cover"
        objectPosition="center"
        layout="fill"
        priority
      />
      <div className="absolute inset-0 bg-black opacity-50"></div>
    </div>
  );
}
