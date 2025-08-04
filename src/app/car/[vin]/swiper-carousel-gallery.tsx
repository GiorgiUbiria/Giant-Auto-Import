"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { imageCacheService } from "@/lib/image-cache";
import OptimizedImage, { OptimizedThumbnail } from "./optimized-image";
import { Gallery, Item } from 'react-photoswipe-gallery';
import 'photoswipe/dist/photoswipe.css';
import { useImageGallery, useCarUI } from "./use-car-state";
import { ImageType } from "@/lib/car-atoms";
import dynamic from 'next/dynamic';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const DownloadButton = dynamic(() => import("./download-button"), {
  loading: () => <div className="flex items-center justify-center p-4">Loading...</div>,
  ssr: false,
});

interface SwiperCarouselGalleryProps {
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

export const SwiperCarouselGallery = ({ vin, fetchByType = false }: SwiperCarouselGalleryProps) => {
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

  // Memoize image types to prevent re-renders
  const imageTypes: ImageType[] = useMemo(() => ["AUCTION", "PICK_UP", "WAREHOUSE", "DELIVERED"], []);

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

  // Memoize filtered images to prevent unnecessary re-renders
  const currentFilteredImages = useMemo(() => {
    return filteredImages.filter(img => img.imageType === selectedImageType);
  }, [filteredImages, selectedImageType]);

  if (imageLoading) {
    return <LoadingState />;
  }

  if (imageError) {
    return <ErrorState />;
  }

  if (!hasImages || filteredImages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Image Type Tabs */}
      <Tabs value={selectedImageType} onValueChange={(value) => setSelectedImageType(value as ImageType)}>
        <TabsList className="grid w-full grid-cols-4">
          {imageTypes.map((type) => (
            <TabsTrigger key={type} value={type} className="flex items-center gap-2">
              {type}
              {imageTypeCounts[type] > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {imageTypeCounts[type]}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {imageTypes.map((type) => (
          <TabsContent key={type} value={type} className="mt-6">
            <Gallery
              id={`car-swiper-${vin}-${type}`}
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
              <Swiper
                modules={[Navigation, Pagination, Keyboard, A11y]}
                spaceBetween={30}
                slidesPerView={1}
                navigation={{
                  nextEl: '.swiper-button-next',
                  prevEl: '.swiper-button-prev',
                }}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                keyboard={{
                  enabled: true,
                  onlyInViewport: true,
                }}
                a11y={{
                  prevSlideMessage: 'Previous image',
                  nextSlideMessage: 'Next image',
                  firstSlideMessage: 'This is the first image',
                  lastSlideMessage: 'This is the last image',
                }}
                className="carousel-swiper"
              >
                {currentFilteredImages.map((image, index) => (
                  <SwiperSlide key={image.imageKey}>
                    <Item
                      original={image.url}
                      thumbnail={image.url}
                      width={1920}
                      height={1080}
                      alt={image.imageKey}
                      caption={`${image.imageType} - ${image.imageKey}`}
                    >
                      {({ ref, open }) => (
                        <div className="relative aspect-[16/9] cursor-pointer group overflow-hidden rounded-xl car-section">
                          <div ref={ref} onClick={open} className="w-full h-full">
                            <OptimizedImage
                              src={image.url}
                              alt={image.imageKey}
                              width={1920}
                              height={1080}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onLoad={() => handleImageLoad(image.imageKey)}
                              quality={imageQuality}
                            />
                          </div>

                          {/* Overlay with controls */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
                            {/* Image info */}
                            <div className="absolute bottom-4 left-4 right-4">
                              <div className="flex items-center justify-between">
                                <div className="text-white">
                                  <p className="font-medium">{image.imageKey}</p>
                                  <p className="text-sm opacity-80">{image.imageType}</p>
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
                                  <DownloadButton
                                    imageUrl={image.url}
                                    imageKey={image.imageKey}
                                    variant="outline"
                                    size="sm"
                                    className="bg-white/20 backdrop-blur-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Item>
                  </SwiperSlide>
                ))}
              </Swiper>
            </Gallery>
          </TabsContent>
        ))}
      </Tabs>

      {/* Thumbnail Preview */}
      {currentFilteredImages.length > 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold car-text-primary">All Images</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {currentFilteredImages.map((image, index) => (
              <div
                key={image.imageKey}
                className="relative flex-shrink-0 cursor-pointer transition-all duration-200 opacity-70 hover:opacity-100"
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

      {/* Custom Swiper Styles */}
      <style jsx global>{`
        .carousel-swiper {
          --swiper-navigation-color: hsl(var(--primary));
          --swiper-pagination-color: hsl(var(--primary));
          --swiper-pagination-bullet-inactive-color: hsl(var(--muted-foreground));
          --swiper-pagination-bullet-inactive-opacity: 0.3;
        }
        .carousel-swiper .swiper-button-next,
        .carousel-swiper .swiper-button-prev {
          background-color: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          color: white;
        }
        
        .carousel-swiper .swiper-button-next:hover,
        .carousel-swiper .swiper-button-prev:hover {
          background-color: rgba(255, 255, 255, 0.3);
        }
        
        .carousel-swiper .swiper-button-next::after,
        .carousel-swiper .swiper-button-prev::after {
          font-size: 16px;
          font-weight: bold;
        }
        
        .carousel-swiper .swiper-pagination-bullet {
          background-color: hsl(var(--primary));
          opacity: 0.7;
        }
        
        .carousel-swiper .swiper-pagination-bullet-active {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}; 