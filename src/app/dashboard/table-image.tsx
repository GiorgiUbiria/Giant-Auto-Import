"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import NoImage from "../../../public/no-car-image.webp";

export const TableImage = ({ vin }: { vin: string }) => {
  const [data, setData] = React.useState<{ url: string } | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/images/${encodeURIComponent(vin)}?mode=single`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch image');
        const json = await res.json();
        if (!cancelled) setData(json?.data || null);
      } catch (e: any) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [vin]);

  if (error || (!data && !isLoading)) {
    return (
      <div className="absolute inset-0 w-full h-full">
        <Image
          alt="Car Image"
          className="object-cover"
          fill
          src={NoImage}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7/2Q=="
          loading="lazy"
          sizes="154px"
          style={{ objectFit: 'cover' }}
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
          className="object-cover"
          fill
          src={data?.url!}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECIgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7/2Q=="
          loading="lazy"
          sizes="154px"
          onError={(e) => {
            console.error('Image failed to load:', data?.url!);
            e.currentTarget.src = NoImage.src;
          }}
          style={{ objectFit: 'cover' }}
        />
      )}
    </div>
  );
};
