"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { imageCacheService } from "@/lib/image-cache";
import OptimizedImage, { OptimizedThumbnail } from "./optimized-image";
import { Gallery, Item } from 'react-photoswipe-gallery';
import 'photoswipe/dist/photoswipe.css';
import { useImageGallery, useCarUI } from "./use-car-state";
import { ImageType } from "@/lib/car-atoms";
import dynamic from 'next/dynamic';

const DownloadButton = dynamic(() => import("./download-button"), {
  loading: () => <div className="flex items-center justify-center p-4">Loading...</div>,
  ssr: false,
});

interface CarouselImageGalleryProps {
  vin: string;
  fetchByType?: boolean;
}

const LoadingState = () => (
  <div className="w-full h-[50vh] grid place-items-center">
    <div className="flex flex-col items-center gap-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="car-text-secondary">Loading images...</p>
    </div>
  </div>
);

const ErrorState = () => (
  <div className="w-full h-[50vh] grid place-items-center">
    <Card className="w-full max-w-md car-card">
      <CardContent className="p-6 text-center">
        <div className="text-6xl mb-4">📷</div>
        <h3 className="text-lg font-semibold mb-2 car-text-primary">Error Loading Images</h3>
        <p className="car-text-secondary">Failed to load car images. Please try again later.</p>
      </CardContent>
    </Card>
  </div>
);

const EmptyState = () => (
  <div className="w-full h-[50vh] grid place-items-center">
    <Card className="w-full max-w-md car-card">
      <CardContent className="p-6 text-center">
        <div className="text-6xl mb-4">📷</div>
        <h3 className="text-lg font-semibold mb-2 car-text-primary">No Images Available</h3>
        <p className="car-text-secondary">No images have been uploaded for this car yet.</p>
      </CardContent>
    </Card>
  </div>
);

export const CarouselImageGallery = ({ vin, fetchByType = false }: CarouselImageGalleryProps) => {
  const {
    images,
    imageLoading,
    imageError,
    selectedImageType,
    loadedImages,
    filteredImages,
    imageTypeCounts,
    hasImages,
    setImages,
    setImageLoading,
    setImageError,
    setSelectedImageType,
    setLoadedImages,
  } = useImageGallery();

  const {
    imageQuality,
    setImageQuality,
  } = useCarUI();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  // Fetch images
  const fetchImages = useCallback(async () => {
    try {
      setImageLoading(true);
      setImageError(null);
      
      const result = await imageCacheService.getImageList({
        vin,
        type: fetchByType ? selectedImageType : undefined,
        pageSize: 0, // Get all images
        revalidate: 60 * 1000, // 1 minute cache for public gallery
      });
      
      if (result.images) {
        setImages(result.images);
      } else {
        setImageError("Failed to load images");
      }
    } catch (error) {
      setImageError("Failed to load images");
    } finally {
      setImageLoading(false);
    }
  }, [vin, fetchByType, selectedImageType, setImages, setImageLoading, setImageError]);

  // Load images on mount and when dependencies change
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Handle image load
  const handleImageLoad = useCallback((imageKey: string) => {
    setLoadedImages(prev => new Set(Array.from(prev).concat(imageKey)));
  }, [setLoadedImages]);

  // Navigation functions
  const goToNext = useCallback(() => {
    if (filteredImages.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
    }
  }, [filteredImages.length]);

  const goToPrevious = useCallback(() => {
    if (filteredImages.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
    }
  }, [filteredImages.length]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Touch/Mouse event handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    setCurrentX(e.clientX);
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    
    const diff = startX - currentX;
    const threshold = 50; // Minimum distance to trigger slide
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
    
    setIsDragging(false);
  }, [isDragging, startX, currentX, goToNext, goToPrevious]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  if (imageLoading) {
    return <LoadingState />;
  }

  if (imageError) {
    return <ErrorState />;
  }

  if (!hasImages || filteredImages.length === 0) {
    return <EmptyState />;
  }

  const currentImage = filteredImages[currentIndex];
  const imageTypes: ImageType[] = ["AUCTION", "PICK_UP", "WAREHOUSE", "DELIVERED"];

  return (
    <div className="space-y-6">
      {/* Image Type Tabs */}
      <div className="flex justify-center">
        <div className="flex gap-2 p-1 car-section rounded-lg">
          {imageTypes.map((type) => (
            <Button
              key={type}
              variant={selectedImageType === type ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedImageType(type)}
              className="flex items-center gap-2"
            >
              {type}
              {imageTypeCounts[type] > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {imageTypeCounts[type]}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Carousel */}
      <div className="relative">
        <Gallery
          id={`car-carousel-${vin}`}
          options={{
            bgOpacity: 0.9,
            padding: { top: 20, bottom: 40, left: 40, right: 40 },
            showHideAnimationType: 'fade',
            showAnimationDuration: 300,
            hideAnimationDuration: 300,
            easing: 'cubic-bezier(0.4, 0, 0.22, 1)',
          }}
          withCaption
        >
          <Item
            original={currentImage.url}
            thumbnail={currentImage.url}
            width={1920}
            height={1080}
            alt={currentImage.imageKey}
            caption={`${currentImage.imageType} - ${currentImage.imageKey}`}
          >
            {({ ref, open }) => (
              <div
                ref={ref}
                onClick={open}
                className="relative aspect-[16/9] cursor-pointer group overflow-hidden rounded-xl car-section"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                <OptimizedImage
                  src={currentImage.url}
                  alt={currentImage.imageKey}
                  width={1920}
                  height={1080}
                  className="w-full h-full object-cover transition-transform duration-300"
                  onLoad={() => handleImageLoad(currentImage.imageKey)}
                  quality={imageQuality}
                />
                
                {/* Overlay with controls */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                  <div className="absolute inset-0 flex items-center justify-between p-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPrevious();
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNext();
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 backdrop-blur-sm"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Image info */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between">
                      <div className="text-white">
                        <p className="font-medium">{currentImage.imageKey}</p>
                        <p className="text-sm opacity-80">{currentImage.imageType}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            open(e);
                          }}
                          className="bg-white/20 backdrop-blur-sm"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DownloadButton imageUrl={currentImage.url} imageKey={currentImage.imageKey} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Item>
        </Gallery>

        {/* Navigation arrows */}
        <Button
          variant="outline"
          size="icon"
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Image counter */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {filteredImages.length}
        </div>
      </div>

      {/* Thumbnail Preview */}
      {filteredImages.length > 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold car-text-primary">All Images</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filteredImages.map((image, index) => (
              <div
                key={image.imageKey}
                className={`relative flex-shrink-0 cursor-pointer transition-all duration-200 ${
                  index === currentIndex ? 'ring-2 ring-primary scale-105' : 'opacity-70 hover:opacity-100'
                }`}
                onClick={() => goToIndex(index)}
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden car-section">
                  <OptimizedThumbnail
                    src={image.url}
                    alt={image.imageKey}
                    className="w-full h-full object-cover"
                    onLoad={() => handleImageLoad(image.imageKey)}
                    quality="low"
                  />
                </div>
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-primary/20 rounded-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Quality Control */}
      <div className="flex justify-center">
        <div className="flex gap-2 p-1 car-section rounded-lg">
          {(['low', 'medium', 'high'] as const).map((quality) => (
            <Button
              key={quality}
              variant={imageQuality === quality ? "default" : "ghost"}
              size="sm"
              onClick={() => setImageQuality(quality)}
              className="capitalize"
            >
              {quality}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}; 