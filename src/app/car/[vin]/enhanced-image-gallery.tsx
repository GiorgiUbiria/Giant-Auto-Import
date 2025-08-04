"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Grid3X3, 
  List, 
  Play, 
  Pause, 
  Settings, 
  Download,
  Eye,
  Image as ImageIcon
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { imageCacheService } from "@/lib/image-cache";
import OptimizedImage, { OptimizedThumbnail } from "./optimized-image";
import dynamic from 'next/dynamic';
import { useImageGallery, useLightbox, useCarUI } from "./use-car-state";
import { ImageType } from "@/lib/car-atoms";

// Import lightbox and plugins dynamically
const Lightbox = dynamic(() => import("yet-another-react-lightbox"), {
  loading: () => <div className="flex items-center justify-center p-4">Loading...</div>,
  ssr: false,
});

const DownloadPlugin = dynamic(() => import("yet-another-react-lightbox/plugins/download"), {
  ssr: false,
});

const InlinePlugin = dynamic(() => import("yet-another-react-lightbox/plugins/inline"), {
  ssr: false,
});

const ThumbnailsPlugin = dynamic(() => import("yet-another-react-lightbox/plugins/thumbnails"), {
  ssr: false,
});

const DownloadButton = dynamic(() => import("./download-button"), {
  loading: () => <div className="flex items-center justify-center p-4">Loading...</div>,
  ssr: false,
});

const NextJsImage = dynamic(() => import("./nextjs-image"), {
  loading: () => <div className="flex items-center justify-center p-4">Loading...</div>,
  ssr: false,
});

const LoadingState = () => (
  <div className="w-full h-[50vh] grid place-items-center">
    <div className="flex flex-col items-center gap-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="text-muted-foreground">Loading images...</p>
    </div>
  </div>
);

const ErrorState = () => (
  <div className="w-full h-[50vh] grid place-items-center">
    <Card className="w-full max-w-md">
      <CardContent className="p-6 text-center">
        <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Images</h3>
        <p className="text-muted-foreground">Failed to load car images. Please try again later.</p>
      </CardContent>
    </Card>
  </div>
);

const EmptyState = () => (
  <div className="w-full h-[50vh] grid place-items-center">
    <Card className="w-full max-w-md">
      <CardContent className="p-6 text-center">
        <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Images Available</h3>
        <p className="text-muted-foreground">No images have been uploaded for this car yet.</p>
      </CardContent>
    </Card>
  </div>
);

interface EnhancedImageGalleryProps {
  vin: string;
  fetchByType?: boolean;
}

export const EnhancedImageGallery = ({ vin, fetchByType = false }: EnhancedImageGalleryProps) => {
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
    addLoadedImage,
  } = useImageGallery();

  const {
    lightboxOpen,
    lightboxStartIndex,
    lightboxSlides,
    openLightbox,
    closeLightbox,
  } = useLightbox();

  const {
    imageGalleryView,
    autoPlay,
    imageQuality,
    toggleImageView,
    toggleAutoPlay,
    setImageQuality,
  } = useCarUI();

  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const imageTypes: ImageType[] = ["AUCTION", "PICK_UP", "WAREHOUSE", "DELIVERED"];

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
      
      if (result.success && result.data) {
        setImages(result.data);
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
    addLoadedImage(imageKey);
  }, [addLoadedImage]);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && filteredImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % filteredImages.length);
      }, 3000);
      setAutoPlayInterval(interval);
      
      return () => {
        clearInterval(interval);
        setAutoPlayInterval(null);
      };
    } else {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        setAutoPlayInterval(null);
      }
    }
  }, [autoPlay, filteredImages.length]);

  // Handle image type change
  const handleImageTypeChange = useCallback((type: ImageType) => {
    setSelectedImageType(type);
    setCurrentImageIndex(0);
  }, [setSelectedImageType]);

  // Handle image click
  const handleImageClick = useCallback((index: number) => {
    openLightbox(index);
  }, [openLightbox]);

  if (imageLoading) {
    return <LoadingState />;
  }

  if (imageError) {
    return <ErrorState />;
  }

  if (!hasImages) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {/* Gallery Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Tabs value={selectedImageType} onValueChange={(value) => handleImageTypeChange(value as ImageType)}>
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
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleImageView}
            className="flex items-center gap-2"
          >
            {imageGalleryView === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            {imageGalleryView === 'grid' ? 'List' : 'Grid'}
          </Button>

          {filteredImages.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoPlay}
              className="flex items-center gap-2"
            >
              {autoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              Auto
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setImageQuality(imageQuality === 'high' ? 'medium' : imageQuality === 'medium' ? 'low' : 'high')}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {imageQuality}
          </Button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative">
        {imageGalleryView === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((image, index) => (
              <div
                key={image.imageKey}
                className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg"
                onClick={() => handleImageClick(index)}
              >
                <OptimizedThumbnail
                  src={image.url}
                  alt={image.imageKey}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onLoad={() => handleImageLoad(image.imageKey)}
                  quality={imageQuality}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="h-4 w-4 text-white" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredImages.map((image, index) => (
              <Card key={image.imageKey} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <OptimizedThumbnail
                        src={image.url}
                        alt={image.imageKey}
                        className="w-full h-full object-cover rounded"
                        onLoad={() => handleImageLoad(image.imageKey)}
                        quality={imageQuality}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{image.imageKey}</h4>
                      <p className="text-sm text-muted-foreground">{image.imageType}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(index);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <DownloadButton imageUrl={image.url} imageKey={image.imageKey} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={closeLightbox}
          index={lightboxStartIndex}
          slides={lightboxSlides}
          plugins={[DownloadPlugin, InlinePlugin, ThumbnailsPlugin]}
          carousel={{
            finite: true,
          }}
          thumbnails={{
            position: "bottom",
          }}
          download={{
            url: lightboxSlides[lightboxStartIndex]?.downloadUrl,
            filename: `car-image-${vin}-${lightboxStartIndex + 1}.jpg`,
          }}
        />
      )}
    </div>
  );
}; 