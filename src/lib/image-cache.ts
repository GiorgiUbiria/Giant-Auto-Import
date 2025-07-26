import { db } from '@/lib/drizzle/db';
import { images } from '@/lib/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const ISR_REVALIDATE_TIME = 60; // 60 seconds for ISR

interface ImageData {
  id: number;
  imageKey: string;
  imageType: "AUCTION" | "WAREHOUSE" | "DELIVERED" | "PICK_UP";
  carVin: string;
  priority: boolean | null;
  url: string;
}

interface CacheEntry {
  data: ImageData[];
  count: number;
  timestamp: number;
  totalPages: number;
  currentPage: number;
}

interface FetchOptions {
  vin: string;
  type?: string;
  page?: number;
  pageSize?: number;
  revalidate?: number;
}

class ImageCacheService {
  private cache = new Map<string, CacheEntry>();
  private publicUrl = process.env.NEXT_PUBLIC_BUCKET_URL || '';

  private generateCacheKey(options: FetchOptions): string {
    const { vin, type, page = 1, pageSize = 12 } = options;
    return `${vin}:${type || 'all'}:${page}:${pageSize}`;
  }

  private isCacheValid(entry: CacheEntry, revalidateTime: number = CACHE_DURATION): boolean {
    return Date.now() - entry.timestamp < revalidateTime;
  }

  private async fetchFromDatabase(options: FetchOptions): Promise<{
    images: ImageData[];
    count: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { vin, type, page = 1, pageSize = 12 } = options;
    const noPagination = pageSize === 0;

    // Build where clause
    const allowedTypes = ["AUCTION", "WAREHOUSE", "DELIVERED", "PICK_UP"];
    let whereClause;
    if (type && allowedTypes.includes(type)) {
      whereClause = and(
        eq(images.carVin, vin),
        eq(images.imageType, type as "AUCTION" | "WAREHOUSE" | "DELIVERED" | "PICK_UP")
      );
    } else {
      whereClause = eq(images.carVin, vin);
    }

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(images)
      .where(whereClause);
    const count = totalCount[0]?.count || 0;

    // Fetch images
    let imageKeys;
    if (noPagination) {
      imageKeys = await db.query.images.findMany({
        where: whereClause,
        orderBy: (images, { desc }) => [desc(images.priority), desc(images.id)],
      });
    } else {
      imageKeys = await db.query.images.findMany({
        where: whereClause,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        orderBy: (images, { desc }) => [desc(images.priority), desc(images.id)],
      });
    }

    // Add URLs to the response
    const imagesWithUrls = imageKeys.map(img => ({
      ...img,
      url: `${this.publicUrl}/${img.imageKey}`,
    }));

    return {
      images: imagesWithUrls,
      count,
      totalPages: Math.ceil(count / pageSize),
      currentPage: page,
    };
  }

  async getImageList(options: FetchOptions): Promise<{
    images: ImageData[];
    count: number;
    totalPages: number;
    currentPage: number;
  }> {
    const cacheKey = this.generateCacheKey(options);
    const cachedEntry = this.cache.get(cacheKey);

    // Check if cache is valid
    if (cachedEntry && this.isCacheValid(cachedEntry, options.revalidate)) {
      return {
        images: cachedEntry.data,
        count: cachedEntry.count,
        totalPages: cachedEntry.totalPages,
        currentPage: cachedEntry.currentPage,
      };
    }

    // Fetch fresh data
    const freshData = await this.fetchFromDatabase(options);

    // Update cache
    this.cache.set(cacheKey, {
      data: freshData.images,
      count: freshData.count,
      timestamp: Date.now(),
      totalPages: freshData.totalPages,
      currentPage: freshData.currentPage,
    });

    return freshData;
  }

  // Clear cache for specific VIN
  clearCacheForVin(vin: string): void {
    const keysToDelete: string[] = [];
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.startsWith(`${vin}:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Clear all cache
  clearAllCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): {
    size: number;
    keys: string[];
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Preload images for better UX
  async preloadImages(imageUrls: string[], concurrency: number = 3): Promise<void> {
    const chunks = [];
    for (let i = 0; i < imageUrls.length; i += concurrency) {
      chunks.push(imageUrls.slice(i, i + concurrency));
    }

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(url => {
          return new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Don't fail on error
            img.src = url;
          });
        })
      );
    }
  }

  // Get optimized image URL with parameters
  getOptimizedUrl(imageKey: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}): string {
    const { width, height, quality = 80, format = 'webp' } = options;
    const baseUrl = `${this.publicUrl}/${imageKey}`;
    
    // If no optimization parameters, return base URL
    if (!width && !height) {
      return baseUrl;
    }

    // Add optimization parameters
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('q', quality.toString());
    params.append('f', format);

    return `${baseUrl}?${params.toString()}`;
  }
}

// Export singleton instance
export const imageCacheService = new ImageCacheService();

// Export utility functions
export const clearImageCache = (vin: string) => imageCacheService.clearCacheForVin(vin);
export const clearAllImageCache = () => imageCacheService.clearAllCache();
export const getImageCacheStats = () => imageCacheService.getCacheStats();
export const preloadImages = (urls: string[], concurrency?: number) => 
  imageCacheService.preloadImages(urls, concurrency);
export const getOptimizedImageUrl = (imageKey: string, options?: any) => 
  imageCacheService.getOptimizedUrl(imageKey, options); 