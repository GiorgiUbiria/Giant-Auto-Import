import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Calculator utilities moved to calculator-utils.ts for better tree shaking

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
};

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

// Calculator utilities moved to calculator-utils.ts for better tree shaking

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
  getResponsiveSizes: (usage: 'thumbnail' | 'preview' | 'fullscreen' | 'gallery' | 'lightbox') => {
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
      },
      lightbox: {
        mobile: 800,
        tablet: 1200,
        desktop: 1920,
        retina: 2560
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

  // Generate blur data URL for placeholder
  getBlurDataURL(): string {
    return "data:image/webp;base64,UklGRiIAAABXRUJQVlA4ICwAAACwAgCdASoCAAIALmk0mk0iIiIiIgBoSywA";
  },

  // Calculate aspect ratio
  getAspectRatio(width: number, height: number): number {
    return width / height;
  },

  // Get optimal image dimensions for container
  getOptimalDimensions(containerWidth: number, containerHeight: number, imageWidth: number, imageHeight: number) {
    const containerRatio = containerWidth / containerHeight;
    const imageRatio = imageWidth / imageHeight;
    
    if (imageRatio > containerRatio) {
      // Image is wider than container
      return {
        width: containerWidth,
        height: containerWidth / imageRatio,
      };
    } else {
      // Image is taller than container
      return {
        width: containerHeight * imageRatio,
        height: containerHeight,
      };
    }
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

// Performance utilities
export const performanceUtils = {
  // Debounce function
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Measure execution time
  measureTime<T>(fn: () => T, label: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${label}: ${end - start}ms`);
    return result;
  },

  // Async measure execution time
  async measureTimeAsync<T>(fn: () => Promise<T>, label: string): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`${label}: ${end - start}ms`);
    return result;
  },
};

// Cache utilities
export const cacheUtils = {
  // Simple in-memory cache
  createCache<T>(maxSize: number = 100) {
    const cache = new Map<string, { value: T; timestamp: number }>();
    
    return {
      get(key: string): T | undefined {
        const item = cache.get(key);
        if (item) {
          // Update timestamp for LRU
          cache.delete(key);
          cache.set(key, item);
          return item.value;
        }
        return undefined;
      },
      
      set(key: string, value: T): void {
        // Implement LRU eviction
        if (cache.size >= maxSize) {
          const firstKey = cache.keys().next().value;
          if (firstKey) {
            cache.delete(firstKey);
          }
        }
        cache.set(key, { value, timestamp: Date.now() });
      },
      
      clear(): void {
        cache.clear();
      },
      
      size(): number {
        return cache.size;
      },
    };
  },
};

/**
 * Format a number as currency with proper comma separators and two decimal places
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "$1,234.56")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
