import Image from "next/image";

import HeroBackgroundImage from "../../public/background2.avif";

export default function HeroImageComponent() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src={HeroBackgroundImage}
        alt="Background Image"
        layout="fill"
        objectFit="cover"
        objectPosition="center"
        priority
      />
      <div className="absolute inset-0 bg-black opacity-50"></div>
    </div>
  );
}
