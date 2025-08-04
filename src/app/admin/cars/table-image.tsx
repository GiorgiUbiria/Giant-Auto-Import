"use client";

import { getImageAction } from "@/lib/actions/imageActions";
import { useServerActionQuery } from "@/lib/hooks/server-action-hooks";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import NoImage from "../../../../public/no-car-image.webp";
import React from "react";
// Enhancement: Preconnect and preload for CDN image domain
// If you haven't installed 'react-dom' for preconnect/preload, run: npm install react-dom
import { preconnect, preload } from 'react-dom';

export const TableImage = ({ vin }: { vin: string }) => {
  const { isLoading, data, error } = useServerActionQuery(getImageAction, {
    input: {
      vin: vin,
    },
    queryKey: ["getImage", vin],
    retry: 2, // Allow 2 retry attempts for better reliability
    staleTime: 5 * 60 * 1000, // 5 minutes - reduced for better responsiveness
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    refetchOnWindowFocus: false, // Prevent refetch on focus
    refetchOnMount: true, // Always refetch on mount to get latest priority
  });

  // Utility to extract CDN base from a URL
  function getCdnBase(url?: string): string | null {
    if (!url) return null;
    try {
      const u = new URL(url);
      return u.origin;
    } catch {
      return null;
    }
  }

  // Preconnect and preload for CDN
  React.useEffect(() => {
    if (data?.url) {
      const cdnBase = getCdnBase(data.url);
      if (cdnBase) preconnect(cdnBase);
      preload(data.url, { as: 'image' });
    }
  }, [data?.url]);

  // Show fallback image on error or no data
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
          sizes="(max-width: 640px) 100px, 150px"
          style={{ objectFit: 'cover' }}
        />
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="animate-spin h-5 w-5" />
        </div>
      ) : data?.url ? (
        <div className="absolute inset-0 w-full h-full">
          <Image
            alt="Car Image"
            className="object-cover"
            fill
            src={data.url}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECIgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7/2Q=="
            loading="lazy"
            sizes="(max-width: 640px) 100px, 150px"
            onError={(e) => {
              console.error('Image failed to load:', data.url);
              e.currentTarget.src = NoImage.src;
            }}
            style={{ objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full">
          <Image
            alt="Car Image"
            className="object-cover"
            fill
            src={NoImage}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECIgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7/2Q=="
            loading="lazy"
            sizes="(max-width: 640px) 100px, 150px"
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
    </>
  );
};
