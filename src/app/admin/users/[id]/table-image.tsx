"use client";

import React from "react";
import { getImageAction } from "@/lib/actions/imageActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import NoImage from "../../../../../public/no-car-image.webp";
import { preconnect, preload } from 'react-dom';

export const TableImage = ({ vin }: { vin: string }) => {
  const { isLoading, data, error } = useServerActionQuery(getImageAction, {
    input: {
      vin: vin,
    },
    queryKey: ["getImage", vin],
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  function getCdnBase(url?: string): string | null {
    if (!url) return null;
    try {
      const u = new URL(url);
      return u.origin;
    } catch {
      return null;
    }
  }

  React.useEffect(() => {
    if (data?.url) {
      const cdnBase = getCdnBase(data.url);
      if (cdnBase) preconnect(cdnBase);
      preload(data.url, { as: 'image' });
    }
  }, [data?.url]);

  if (error || (!data && !isLoading)) {
    return (
      <div className="w-[154px] h-[72px] flex justify-center ml-8">
        <Image
          alt="Car Image"
          className="rounded-md object-cover"
          height={72}
          width={154}
          src={NoImage}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7/2Q=="
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="w-[154px] h-[72px] flex justify-center ml-8">
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : data?.url ? (
        <Image
          alt="Car Image"
          className="rounded-md object-cover"
          height={72}
          width={154}
          src={data.url}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7/2Q=="
          loading="lazy"
          onError={(e) => {
            console.error('Image failed to load:', data.url);
            e.currentTarget.src = NoImage.src;
          }}
        />
      ) : (
        <Image
          alt="Car Image"
          className="rounded-md object-cover"
          height={72}
          width={154}
          src={NoImage}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7/2Q=="
          loading="lazy"
        />
      )}
    </div>
  );
};
