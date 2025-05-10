"use client";

import { getImageAction } from "@/lib/actions/imageActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import NoImage from "../../../public/no-car-image.webp";

export const TableImage = ({ vin }: { vin: string }) => {
  const { isLoading, data } = useServerActionQuery(getImageAction, {
    input: {
      vin: vin,
    },
    queryKey: ["getImage", vin],
  });

  if (!data && !isLoading) {
    return (
      <div className="w-[154px] h-[72px] flex justify-center ml-8">
        <Image
          alt="Car Image"
          className="rounded-md object-cover"
          height={72}
          width={154}
          src={NoImage}
          placeholder="blur"
          blurDataURL="https://motozitelive.blob.core.windows.net/motozite-live/newcars_images/1670408218No-Image.jpg"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="w-[154px] h-[72px] flex justify-center ml-8">
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Image
          alt="Car Image"
          className="rounded-md object-cover"
          height={72}
          width={154}
          src={data?.url!}
          placeholder="blur"
          blurDataURL="https://motozitelive.blob.core.windows.net/motozite-live/newcars_images/1670408218No-Image.jpg"
          loading="lazy"
        />
      )}
    </div>
  );
};
