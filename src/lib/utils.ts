import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { csvData, a_styleData, c_styleData, virtualBidData } from "../../public/csvData";
import { AuctionData, ExtraFee, OceanFee } from "./drizzle/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
};

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

export const oceanShippingRates: OceanFee[] = [
  { state: "Los Angeles, CA", shorthand: "CA", rate: 1675 },
  { state: "Houston, TX", shorthand: "TX", rate: 1075 },
  { state: "New Jersey, NJ", shorthand: "NJ", rate: 1100 },
  { state: "Savannah, GA", shorthand: "GA", rate: 1025 },
];

export const extraFees: ExtraFee[] = [
  { type: "EV/Hybrid", rate: 150 },
  { type: "Pickup", rate: 300 },
  { type: "Service", rate: 100 },
];

export const auctionData: AuctionData[] = csvToJson();

export function parseVirtualBidData(): any[] {
  const rows = virtualBidData.trim().split("\n").slice(1);
  const jsonData: any[] = [];

  for (const row of rows) {
    const [range, fee] = row.split(",");
    const [minRange, maxRange] = range.split("-");

    const obj = {
      minPrice: parseFloat(minRange.replace(/[^0-9.-]+/g, "")),
      maxPrice: parseFloat(maxRange.replace(/[^0-9.-]+/g, "")),
      fee: parseFloat(fee),
    };

    jsonData.push(obj);
  }

  return jsonData;
}

export function styleToJson(style: string): any[] {
  const data = style === "a" ? a_styleData : c_styleData;
  const rows = data.trim().split("\n");

  const jsonData: any[] = [];

  for (let i = 1; i < rows.length; i++) {
    const values = rows[i].split(",");
    const [minRange, maxRange] = values[0].split("-");
    const fee = values[1];

    const obj = {
      minPrice: parseFloat(minRange.replace(/[^0-9.-]+/g, "")),
      maxPrice: maxRange.includes("%") ? maxRange : parseFloat(maxRange.replace(/[^0-9.-]+/g, "")),
      fee: fee.includes("%") ? fee.trim() : parseFloat(fee),
    };

    jsonData.push(obj);
  }

  return jsonData;
}

export function csvToJson(): any[] {
  const rows = csvData.trim().split('\n');
  const jsonData: any[] = [];

  for (let i = 1; i < rows.length; i++) {
    let values = rows[i].split(',').map((value, index) => {
      if (value.startsWith('"') && value.endsWith('"')) {
        return value.substring(1, value.length - 1);
      }
      return value;
    });

    const obj: any = {};
    obj.auction = values[0] === "Copart" ? "Copart" : "IAAI";
    obj.auctionLocation = values[1];

    obj.port = values[5].trim().slice(0, values[5].length - 2);

    obj.zip = values[3];
    obj.rate = parseInt(values[6].replace(/\$/g, ''), 10);

    jsonData.push(obj);
  }

  return jsonData;
}

// Advanced image optimization utilities for R2 bucket
export const imageUtils = {
  // Generate optimized image URL with proper R2 integration
  getOptimizedUrl: (baseUrl: string, imageKey: string, options?: {
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png' | 'avif';
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  }) => {
    // For R2, we need to use a proper image optimization service
    // Options: Cloudflare Images, ImageKit, or custom optimization
    const url = new URL(`${baseUrl}/${imageKey}`);
    
    // If using Cloudflare Images (recommended for R2)
    if (process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_DOMAIN) {
      const cfUrl = new URL(`https://${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_DOMAIN}/${imageKey}`);
      if (options?.width) cfUrl.searchParams.set('w', options.width.toString());
      if (options?.height) cfUrl.searchParams.set('h', options.height.toString());
      if (options?.quality) cfUrl.searchParams.set('q', options.quality.toString());
      if (options?.format) cfUrl.searchParams.set('f', options.format);
      if (options?.fit) cfUrl.searchParams.set('fit', options.fit);
      return cfUrl.toString();
    }
    
    // Fallback to direct R2 URL (no optimization)
    return url.toString();
  },

  // Get responsive image sizes based on viewport and usage
  getResponsiveSizes: (usage: 'thumbnail' | 'preview' | 'fullscreen' | 'gallery') => {
    const sizes = {
      thumbnail: {
        mobile: 90,
        tablet: 120,
        desktop: 150,
        retina: 300
      },
      preview: {
        mobile: 320,
        tablet: 640,
        desktop: 1024,
        retina: 2048
      },
      fullscreen: {
        mobile: 640,
        tablet: 1280,
        desktop: 1920,
        retina: 3840
      },
      gallery: {
        mobile: 480,
        tablet: 960,
        desktop: 1440,
        retina: 2880
      }
    };
    
    return sizes[usage];
  },

  // Generate srcSet for responsive images
  generateSrcSet: (baseUrl: string, imageKey: string, sizes: Record<string, number>, options?: {
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png' | 'avif';
  }) => {
    return Object.entries(sizes)
      .map(([breakpoint, width]) => {
        const url = imageUtils.getOptimizedUrl(baseUrl, imageKey, {
          width,
          quality: options?.quality || 80,
          format: options?.format || 'webp'
        });
        return `${url} ${width}w`;
      })
      .join(', ');
  },

  // Preload image with priority and error handling
  preloadImage: (src: string, priority: 'high' | 'low' = 'low'): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
      
      // Set loading priority
      if (priority === 'high') {
        img.fetchPriority = 'high';
      }
      
      img.src = src;
    });
  },

  // Intelligent batch preloading with priority
  preloadImages: async (urls: string[], options?: {
    concurrency?: number;
    priority?: 'high' | 'low';
    maxImages?: number;
  }): Promise<void> => {
    const concurrency = options?.concurrency || 2;
    const priority = options?.priority || 'low';
    const maxImages = options?.maxImages || 5;
    
    // Limit number of images to preload
    const limitedUrls = urls.slice(0, maxImages);
    
    const chunks = [];
    for (let i = 0; i < limitedUrls.length; i += concurrency) {
      chunks.push(limitedUrls.slice(i, i + concurrency));
    }

    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(url => imageUtils.preloadImage(url, priority))
      );
    }
  },

  // Get appropriate image size based on viewport and device pixel ratio
  getOptimalSize: (containerWidth: number, usage: 'thumbnail' | 'preview' | 'fullscreen' | 'gallery'): number => {
    const sizes = imageUtils.getResponsiveSizes(usage);
    const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    
    let baseSize: number;
    if (containerWidth <= 640) baseSize = sizes.mobile;
    else if (containerWidth <= 1024) baseSize = sizes.tablet;
    else baseSize = sizes.desktop;
    
    // Account for high DPI displays
    return Math.round(baseSize * Math.min(pixelRatio, 2));
  },

  // Generate placeholder data URL for blur effect
  generatePlaceholder: (width: number, height: number): string => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a simple gradient placeholder
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#f3f4f6');
      gradient.addColorStop(1, '#e5e7eb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    
    return canvas.toDataURL('image/jpeg', 0.1);
  },

  // Cache management utilities
  cache: {
    // Simple in-memory cache for image loading states
    imageCache: new Map<string, { loaded: boolean; timestamp: number }>(),
    
    // Check if image is cached
    isCached: (key: string): boolean => {
      const cached = imageUtils.cache.imageCache.get(key);
      if (!cached) return false;
      
      // Cache expires after 5 minutes
      const now = Date.now();
      if (now - cached.timestamp > 5 * 60 * 1000) {
        imageUtils.cache.imageCache.delete(key);
        return false;
      }
      
      return cached.loaded;
    },
    
    // Mark image as cached
    setCached: (key: string): void => {
      imageUtils.cache.imageCache.set(key, {
        loaded: true,
        timestamp: Date.now()
      });
    },
    
    // Clear expired cache entries
    cleanup: (): void => {
      const now = Date.now();
      const entries = Array.from(imageUtils.cache.imageCache.entries());
      for (const [key, value] of entries) {
        if (now - value.timestamp > 5 * 60 * 1000) {
          imageUtils.cache.imageCache.delete(key);
        }
      }
    }
  }
};
