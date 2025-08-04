import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { atomWithHash } from 'jotai-location';
import { selectCarSchema } from '@/lib/drizzle/schema';
import { z } from 'zod';

// Types
export type CarData = z.infer<typeof selectCarSchema>;
export type ImageData = {
    imageKey: string;
    imageType: "WAREHOUSE" | "PICK_UP" | "DELIVERED" | "AUCTION";
    url: string;
    priority: boolean | null;
};

export type ImageType = "AUCTION" | "PICK_UP" | "WAREHOUSE" | "DELIVERED";

// Car data atoms
export const carDataAtom = atom<CarData | null>(null);
export const carLoadingAtom = atom(true);
export const carErrorAtom = atom<string | null>(null);

// Image gallery atoms
export const imageGalleryAtom = atom<ImageData[]>([]);
export const imageLoadingAtom = atom(true);
export const imageErrorAtom = atom<string | null>(null);
export const selectedImageTypeAtom = atom<ImageType>("AUCTION");
export const loadedImagesAtom = atom<Set<string>>(new Set<string>());

// Lightbox atoms
export const lightboxOpenAtom = atom(false);
export const lightboxStartIndexAtom = atom(0);

// UI state atoms
export const isMobileAtom = atom(false);
export const imageGalleryViewAtom = atomWithStorage<'grid' | 'list'>('car-image-view', 'grid');
export const autoPlayAtom = atomWithStorage('car-autoplay', false);
export const imageQualityAtom = atomWithStorage<'low' | 'medium' | 'high'>('car-image-quality', 'medium');

// URL hash atoms for deep linking
export const selectedImageIndexAtom = atomWithHash('image', 0);

// Derived atoms
export const filteredImagesAtom = atom((get) => {
    const images = get(imageGalleryAtom);
    const selectedType = get(selectedImageTypeAtom);

    if (!images.length) return [];

    return images.filter(image => image.imageType === selectedType);
});

export const imageTypeCountsAtom = atom((get) => {
    const images = get(imageGalleryAtom);
    const counts: Record<ImageType, number> = {
        AUCTION: 0,
        PICK_UP: 0,
        WAREHOUSE: 0,
        DELIVERED: 0,
    };

    images.forEach(image => {
        counts[image.imageType]++;
    });

    return counts;
});

export const hasImagesAtom = atom((get) => {
    const images = get(imageGalleryAtom);
    return images.length > 0;
});

export const carStatusAtom = atom((get) => {
    const carData = get(carDataAtom);
    return carData?.shippingStatus || 'UNKNOWN';
});

// Action atoms for car data
export const setCarDataAtom = atom(
    null,
    (get, set, carData: CarData) => {
        set(carDataAtom, carData);
        set(carLoadingAtom, false);
        set(carErrorAtom, null);
    }
);

export const setCarLoadingAtom = atom(
    null,
    (get, set, loading: boolean) => {
        set(carLoadingAtom, loading);
    }
);

export const setCarErrorAtom = atom(
    null,
    (get, set, error: string | null) => {
        set(carErrorAtom, error);
        set(carLoadingAtom, false);
    }
);

// Action atoms for image gallery
export const setImageGalleryAtom = atom(
    null,
    (get, set, images: ImageData[]) => {
        set(imageGalleryAtom, images);
        set(imageLoadingAtom, false);
        set(imageErrorAtom, null);
    }
);

export const setImageLoadingAtom = atom(
    null,
    (get, set, loading: boolean) => {
        set(imageLoadingAtom, loading);
    }
);

export const setImageErrorAtom = atom(
    null,
    (get, set, error: string | null) => {
        set(imageErrorAtom, error);
        set(imageLoadingAtom, false);
    }
);

export const setSelectedImageTypeAtom = atom(
    null,
    (get, set, imageType: ImageType) => {
        set(selectedImageTypeAtom, imageType);
    }
);

export const addLoadedImageAtom = atom(
    null,
    (get, set, imageKey: string) => {
        const currentLoaded = get(loadedImagesAtom);
        set(loadedImagesAtom, new Set(Array.from(currentLoaded).concat(imageKey)));
    }
);

// Action atoms for lightbox
export const openLightboxAtom = atom(
    null,
    (get, set, startIndex: number = 0) => {
        set(lightboxOpenAtom, true);
        set(lightboxStartIndexAtom, startIndex);
    }
);

export const closeLightboxAtom = atom(
    null,
    (get, set) => {
        set(lightboxOpenAtom, false);
    }
);

// Action atoms for UI state
export const setMobileAtom = atom(
    null,
    (get, set, isMobile: boolean) => {
        set(isMobileAtom, isMobile);
    }
);

export const toggleImageViewAtom = atom(
    null,
    (get, set) => {
        const currentView = get(imageGalleryViewAtom);
        set(imageGalleryViewAtom, currentView === 'grid' ? 'list' : 'grid');
    }
);

export const toggleAutoPlayAtom = atom(
    null,
    (get, set) => {
        const currentAutoPlay = get(autoPlayAtom);
        set(autoPlayAtom, !currentAutoPlay);
    }
);

export const setImageQualityAtom = atom(
    null,
    (get, set, quality: 'low' | 'medium' | 'high') => {
        set(imageQualityAtom, quality);
    }
);

// Reset atoms
export const resetCarStateAtom = atom(
    null,
    (get, set) => {
        set(carDataAtom, null);
        set(carLoadingAtom, true);
        set(carErrorAtom, null);
        set(imageGalleryAtom, []);
        set(imageLoadingAtom, true);
        set(imageErrorAtom, null);
        set(selectedImageTypeAtom, "AUCTION");
        set(loadedImagesAtom, new Set());
        set(lightboxOpenAtom, false);
        set(lightboxStartIndexAtom, 0);
    }
);

// Utility atoms for formatting and display
export const formatCarStatusAtom = atom((get) => {
    return (status: string) => {
        switch (status) {
            case 'PICKED_UP':
                return 'Picked Up';
            case 'IN_TRANSIT':
                return 'In Transit';
            case 'DELIVERED':
                return 'Delivered';
            case 'WAREHOUSE':
                return 'In Warehouse';
            default:
                return status.replace(/_/g, ' ').toLowerCase()
                    .replace(/\b\w/g, l => l.toUpperCase());
        }
    };
});

export const getImageTypeLabelAtom = atom((get) => {
    return (imageType: ImageType) => {
        switch (imageType) {
            case 'AUCTION':
                return 'Auction';
            case 'PICK_UP':
                return 'Pick Up';
            case 'WAREHOUSE':
                return 'Warehouse';
            case 'DELIVERED':
                return 'Delivered';
            default:
                return imageType;
        }
    };
});

// Computed atoms for slides
export const lightboxSlidesAtom = atom((get) => {
    const filteredImages = get(filteredImagesAtom);

    return filteredImages.map(({ imageKey, url }) => ({
        src: url,
        width: 1920,
        height: 1080,
        downloadUrl: url,
        alt: imageKey,
    }));
});

// Performance optimization atoms
export const imageCacheAtom = atom<Map<string, string>>(new Map());

export const addToImageCacheAtom = atom(
    null,
    (get, set, key: string, url: string) => {
        const cache = get(imageCacheAtom);
        const newCache = new Map(cache);
        newCache.set(key, url);
        set(imageCacheAtom, newCache);
    }
);

export const getFromImageCacheAtom = atom((get) => {
    return (key: string) => {
        const cache = get(imageCacheAtom);
        return cache.get(key);
    };
}); 