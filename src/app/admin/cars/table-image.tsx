"use client";

import { OptimizedImage } from "@/components/ui/optimized-image";
import { imageCacheService } from "@/lib/services/imageCache";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import NoImage from "../../../../public/no-car-image.webp";
// Enhancement: Preconnect and preload for CDN image domain
// If you haven't installed 'react-dom' for preconnect/preload, run: npm install react-dom
import { preconnect, preload } from "react-dom";

export const TableImage = ({ vin }: { vin: string }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log(`TableImage: Fetching image for VIN ${vin}`);
        const result = await imageCacheService.getImage({
          vin,
          revalidate: 5 * 60 * 1000, // 5 minutes cache for admin table
        });

        console.log(`TableImage: Got result for VIN ${vin}:`, result);
        setData(result.data);
      } catch (err) {
        console.error(`TableImage: Error fetching image for VIN ${vin}:`, err);
        setError(err instanceof Error ? err : new Error("Failed to fetch image"));
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [vin]);

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
      preload(data.url, { as: "image" });
    }
  }, [data?.url]);

  // Show fallback image on error or no data
  if (error || (!data && !isLoading)) {
    return (
      <div className="absolute inset-0 w-full h-full">
        <OptimizedImage
          alt="Car Image"
          fill
          src={NoImage}
          objectFit="cover"
          sizes="(max-width: 640px) 100px, 150px"
          showLoader={false}
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
          <OptimizedImage
            alt="Car Image"
            fill
            src={data.url}
            objectFit="cover"
            sizes="(max-width: 640px) 100px, 150px"
            fallbackSrc={NoImage}
            onError={() => {
              console.error("Image failed to load:", data.url);
            }}
          />
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full">
          <OptimizedImage
            alt="Car Image"
            fill
            src={NoImage}
            objectFit="cover"
            sizes="(max-width: 640px) 100px, 150px"
            showLoader={false}
          />
        </div>
      )}
    </>
  );
};
