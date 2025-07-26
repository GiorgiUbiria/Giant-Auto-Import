"use client";

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  if (hasError) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center text-gray-500">
          <div className="text-sm">Failed to load image</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        priority={priority}
        sizes={`(max-width: 640px) ${width}px, ${width}px`}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
}

// Thumbnail optimized component
export function OptimizedThumbnail({
  src,
  alt,
  onClick,
  className = '',
  size = 90
}: {
  src: string;
  alt: string;
  onClick?: () => void;
  className?: string;
  size?: number;
}) {
  return (
    <div onClick={onClick} className={`cursor-pointer ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={size}
        height={size}
        className="hover:opacity-80 transition-opacity"
      />
    </div>
  );
}

// Gallery optimized component
export function OptimizedGalleryImage({
  src,
  alt,
  onClick,
  className = ''
}: {
  src: string;
  alt: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div onClick={onClick} className={`cursor-pointer ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={400}
        height={300}
        className="hover:scale-105 transition-transform"
      />
    </div>
  );
} 