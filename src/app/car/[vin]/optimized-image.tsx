"use client";

import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import { imageUtils } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'avif';
  usage?: 'thumbnail' | 'preview' | 'fullscreen' | 'gallery';
  onLoad?: () => void;
  onError?: () => void;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 80,
  format = 'webp',
  usage = 'preview',
  onLoad,
  onError,
  placeholder = 'empty',
  blurDataURL
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');

  // Generate optimized image URL
  useEffect(() => {
    const optimizedUrl = imageUtils.getOptimizedUrl(src, '', {
      width,
      height,
      quality,
      format
    });
    setImageSrc(optimizedUrl);
  }, [src, width, height, quality, format]);

  // Generate responsive sizes
  const responsiveSizes = imageUtils.getResponsiveSizes(usage);
  const sizes = `(max-width: 640px) ${responsiveSizes.mobile}px, (max-width: 1024px) ${responsiveSizes.tablet}px, ${responsiveSizes.desktop}px`;

  // Next.js Image component handles srcSet automatically based on sizes prop

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    imageUtils.cache.setCached(src);
    onLoad?.();
  }, [src, onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  // Generate placeholder if needed
  const getPlaceholder = () => {
    if (blurDataURL) return blurDataURL;
    if (placeholder === 'blur') {
      return imageUtils.generatePlaceholder(width, height);
    }
    return undefined;
  };

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
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={getPlaceholder()}
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
        usage="thumbnail"
        quality={70}
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
        usage="gallery"
        quality={85}
      />
    </div>
  );
} 