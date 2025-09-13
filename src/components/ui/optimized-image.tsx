"use client";

import { ImageIcon, Loader2 } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import { useCallback, useState } from "react";

interface OptimizedImageProps {
  src: string | StaticImageData;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  onError?: () => void;
  fallbackSrc?: string | StaticImageData;
  showLoader?: boolean;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  priority = false,
  sizes,
  onError,
  fallbackSrc,
  showLoader = true,
  objectFit = "cover",
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);

    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsLoading(true);
    } else {
      onError?.();
    }
  }, [currentSrc, fallbackSrc, onError]);

  const imageStyle = fill ? { objectFit } : {};

  return (
    <div className={`relative ${fill ? "w-full h-full" : ""} ${className}`}>
      {isLoading && showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center text-gray-500">
            <ImageIcon className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Image not available</p>
          </div>
        </div>
      )}

      {!hasError && (
        <Image
          src={currentSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          className={`transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
          priority={priority}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          style={imageStyle}
          loading={priority ? "eager" : "lazy"}
        />
      )}
    </div>
  );
}

interface ImageGridProps {
  images: Array<{
    imageKey: string;
    imageType: string;
    url: string;
    priority?: boolean;
  }>;
  publicUrl: string;
  onImageClick?: (index: number) => void;
  className?: string;
  imageClassName?: string;
  showThumbnails?: boolean;
}

export function ImageGrid({
  images,
  publicUrl,
  onImageClick,
  className = "",
  imageClassName = "",
  showThumbnails = false,
}: ImageGridProps) {
  const getImageUrl = useCallback(
    (imageKey: string) => {
      if (imageKey.startsWith("http")) {
        return imageKey;
      }
      return `${publicUrl}/${imageKey}`;
    },
    [publicUrl]
  );

  const getThumbnailUrl = useCallback(
    (imageKey: string) => {
      // Try to find thumbnail version
      const thumbnailKey = imageKey.replace(/(\d+)\.png$/, "thumb_$1.png");
      return `${publicUrl}/${thumbnailKey}`;
    },
    [publicUrl]
  );

  if (images.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center text-gray-500">
          <ImageIcon className="h-12 w-12 mx-auto mb-4" />
          <p>No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {images.map((image, index) => (
        <div
          key={image.imageKey}
          className={`relative aspect-[3/2] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer hover:opacity-90 transition-opacity ${imageClassName}`}
          onClick={() => onImageClick?.(index)}
        >
          <OptimizedImage
            src={showThumbnails ? getThumbnailUrl(image.imageKey) : getImageUrl(image.imageKey)}
            alt={`${image.imageType} image ${index + 1}`}
            fill
            objectFit="cover"
            priority={image.priority || index < 3}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            fallbackSrc={getImageUrl(image.imageKey)}
            onError={() => {
              console.warn(`Failed to load image: ${image.imageKey}`);
            }}
          />

          {image.priority && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
              Main
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
