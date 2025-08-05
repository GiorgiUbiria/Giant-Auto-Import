"use client";

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useMedia } from 'react-use';
import { useEffect } from 'react';
import {
  // State atoms
  carDataAtom,
  carLoadingAtom,
  carErrorAtom,
  imageGalleryAtom,
  imageLoadingAtom,
  imageErrorAtom,
  selectedImageTypeAtom,
  loadedImagesAtom,
  lightboxOpenAtom,
  lightboxStartIndexAtom,
  isMobileAtom,
  imageGalleryViewAtom,
  autoPlayAtom,
  imageQualityAtom,
  selectedImageIndexAtom,
  
  // Derived atoms
  filteredImagesAtom,
  imageTypeCountsAtom,
  hasImagesAtom,
  carStatusAtom,
  lightboxSlidesAtom,
  
  // Action atoms
  setCarDataAtom,
  setCarLoadingAtom,
  setCarErrorAtom,
  setImageGalleryAtom,
  setImageLoadingAtom,
  setImageErrorAtom,
  setSelectedImageTypeAtom,
  addLoadedImageAtom,
  openLightboxAtom,
  closeLightboxAtom,
  setMobileAtom,
  toggleImageViewAtom,
  toggleAutoPlayAtom,
  setImageQualityAtom,
  resetCarStateAtom,
  
  // Utility atoms
  formatCarStatusAtom,
  getImageTypeLabelAtom,
  addToImageCacheAtom,
  getFromImageCacheAtom,
  
  // Types
  type CarData,
  type ImageData,
  type ImageType,
} from '@/lib/car-atoms';

export const useCarState = () => {
  // Mobile detection
  const isMobile = useMedia('(max-width: 640px)', false);
  const setMobile = useSetAtom(setMobileAtom);
  
  useEffect(() => {
    setMobile(isMobile);
  }, [isMobile, setMobile]);

  return {
    // Car data state
    carData: useAtomValue(carDataAtom),
    carLoading: useAtomValue(carLoadingAtom),
    carError: useAtomValue(carErrorAtom),
    carStatus: useAtomValue(carStatusAtom),
    
    // Image gallery state
    images: useAtomValue(imageGalleryAtom),
    imageLoading: useAtomValue(imageLoadingAtom),
    imageError: useAtomValue(imageErrorAtom),
    selectedImageType: useAtomValue(selectedImageTypeAtom),
    loadedImages: useAtomValue(loadedImagesAtom),
    filteredImages: useAtomValue(filteredImagesAtom),
    imageTypeCounts: useAtomValue(imageTypeCountsAtom),
    hasImages: useAtomValue(hasImagesAtom),
    
    // Lightbox state
    lightboxOpen: useAtomValue(lightboxOpenAtom),
    lightboxStartIndex: useAtomValue(lightboxStartIndexAtom),
    lightboxSlides: useAtomValue(lightboxSlidesAtom),
    
    // UI state
    isMobile: useAtomValue(isMobileAtom),
    imageGalleryView: useAtomValue(imageGalleryViewAtom),
    autoPlay: useAtomValue(autoPlayAtom),
    imageQuality: useAtomValue(imageQualityAtom),
    selectedImageIndex: useAtomValue(selectedImageIndexAtom),
    
    // Utility functions
    formatCarStatus: useAtomValue(formatCarStatusAtom),
    getImageTypeLabel: useAtomValue(getImageTypeLabelAtom),
    getFromImageCache: useAtomValue(getFromImageCacheAtom),
  };
};

export const useCarActions = () => {
  return {
    // Car data actions
    setCarData: useSetAtom(setCarDataAtom),
    setCarLoading: useSetAtom(setCarLoadingAtom),
    setCarError: useSetAtom(setCarErrorAtom),
    
    // Image gallery actions
    setImageGallery: useSetAtom(setImageGalleryAtom),
    setImageLoading: useSetAtom(setImageLoadingAtom),
    setImageError: useSetAtom(setImageErrorAtom),
    setSelectedImageType: useSetAtom(setSelectedImageTypeAtom),
    addLoadedImage: useSetAtom(addLoadedImageAtom),
    
    // Lightbox actions
    openLightbox: useSetAtom(openLightboxAtom),
    closeLightbox: useSetAtom(closeLightboxAtom),
    
    // UI actions
    setMobile: useSetAtom(setMobileAtom),
    toggleImageView: useSetAtom(toggleImageViewAtom),
    toggleAutoPlay: useSetAtom(toggleAutoPlayAtom),
    setImageQuality: useSetAtom(setImageQualityAtom),
    
    // Cache actions
    addToImageCache: useSetAtom(addToImageCacheAtom),
    
    // Reset action
    resetCarState: useSetAtom(resetCarStateAtom),
  };
};

export const useCarStateAndActions = () => {
  const state = useCarState();
  const actions = useCarActions();
  
  return {
    ...state,
    ...actions,
  };
};

// Specialized hooks for specific use cases
export const useCarData = () => {
  const [carData, setCarData] = useAtom(carDataAtom);
  const [carLoading, setCarLoading] = useAtom(carLoadingAtom);
  const [carError, setCarError] = useAtom(carErrorAtom);
  
  return {
    carData,
    carLoading,
    carError,
    setCarData,
    setCarLoading,
    setCarError,
  };
};

export const useImageGallery = () => {
  const [images, setImages] = useAtom(imageGalleryAtom);
  const [imageLoading, setImageLoading] = useAtom(imageLoadingAtom);
  const [imageError, setImageError] = useAtom(imageErrorAtom);
  const [selectedImageType, setSelectedImageType] = useAtom(selectedImageTypeAtom);
  const [loadedImages, setLoadedImages] = useAtom(loadedImagesAtom);
  
  const filteredImages = useAtomValue(filteredImagesAtom);
  const imageTypeCounts = useAtomValue(imageTypeCountsAtom);
  const hasImages = useAtomValue(hasImagesAtom);
  
  return {
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
  };
};

export const useLightbox = () => {
  const [lightboxOpen, setLightboxOpen] = useAtom(lightboxOpenAtom);
  const [lightboxStartIndex, setLightboxStartIndex] = useAtom(lightboxStartIndexAtom);
  const lightboxSlides = useAtomValue(lightboxSlidesAtom);
  
  const openLightbox = useSetAtom(openLightboxAtom);
  const closeLightbox = useSetAtom(closeLightboxAtom);
  
  return {
    lightboxOpen,
    lightboxStartIndex,
    lightboxSlides,
    setLightboxOpen,
    setLightboxStartIndex,
    openLightbox,
    closeLightbox,
  };
};

export const useCarUI = () => {
  const [imageGalleryView, setImageGalleryView] = useAtom(imageGalleryViewAtom);
  const [autoPlay, setAutoPlay] = useAtom(autoPlayAtom);
  const [imageQuality, setImageQuality] = useAtom(imageQualityAtom);
  const [selectedImageIndex, setSelectedImageIndex] = useAtom(selectedImageIndexAtom);
  
  const toggleImageView = useSetAtom(toggleImageViewAtom);
  const toggleAutoPlay = useSetAtom(toggleAutoPlayAtom);
  
  return {
    imageGalleryView,
    autoPlay,
    imageQuality,
    selectedImageIndex,
    setImageGalleryView,
    setAutoPlay,
    setImageQuality,
    setSelectedImageIndex,
    toggleImageView,
    toggleAutoPlay,
  };
}; 