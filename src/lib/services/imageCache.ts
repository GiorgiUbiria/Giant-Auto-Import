"use client";

interface ImageCacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

interface ImageListParams {
  vin: string;
  type?: string;
  page?: number;
  pageSize?: number;
  revalidate?: number;
}

interface ImageParams {
  vin: string;
  revalidate?: number;
}

class ImageCacheService {
  private cache = new Map<string, ImageCacheEntry>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100; // Maximum number of entries

  private generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}:${params[key]}`)
      .join("|");
    return `${prefix}|${sortedParams}`;
  }

  private isExpired(entry: ImageCacheEntry): boolean {
    return Date.now() > entry.expiresAt;
  }

  private cleanup(): void {
    if (this.cache.size <= this.MAX_CACHE_SIZE) return;

    // Remove expired entries first
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }

    // If still over limit, remove oldest entries
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries()).sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      );

      const toRemove = entries.slice(0, this.cache.size - this.MAX_CACHE_SIZE);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  private set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
    this.cleanup();
  }

  private get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  async getImageList(params: ImageListParams): Promise<any> {
    const { vin, type, page = 1, pageSize = 12, revalidate = this.DEFAULT_TTL } = params;

    const cacheKey = this.generateKey("imageList", { vin, type, page, pageSize });
    const cached = this.get(cacheKey);

    if (cached) {
      console.log(`ImageCache: Cache hit for image list ${vin}`);
      return cached;
    }

    try {
      // Use environment variable if available, fallback to window.location.origin
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      console.log(`ImageCache: Using baseUrl: ${baseUrl}`);
      const url = new URL("/api/images/" + vin, baseUrl);
      if (type) url.searchParams.set("type", type);
      url.searchParams.set("page", page.toString());
      url.searchParams.set("pageSize", pageSize.toString());

      console.log(`ImageCache: Fetching images from ${url.toString()}`);
      const response = await fetch(url.toString());
      if (!response.ok) {
        console.error(
          `ImageCache: Failed to fetch images: ${response.status} ${response.statusText}`
        );
        throw new Error(`Failed to fetch images: ${response.statusText}`);
      }

      const data = await response.json();
      this.set(cacheKey, data, revalidate);

      console.log(`ImageCache: Cached image list for ${vin}`);
      return data;
    } catch (error) {
      console.error("ImageCache: Error fetching image list:", error);
      throw error;
    }
  }

  async getImage(params: ImageParams): Promise<any> {
    const { vin, revalidate = this.DEFAULT_TTL } = params;
    const cacheKey = this.generateKey("image", { vin });
    const cached = this.get(cacheKey);

    if (cached) {
      console.log(`ImageCache: Cache hit for image ${vin}`);
      return cached;
    }

    try {
      // Use environment variable if available, fallback to window.location.origin
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
      console.log(`ImageCache: Using baseUrl for single image: ${baseUrl}`);
      const url = new URL("/api/images/" + vin, baseUrl);
      url.searchParams.set("mode", "single");

      console.log(`ImageCache: Fetching single image from ${url.toString()}`);
      const response = await fetch(url.toString());
      if (!response.ok) {
        console.error(
          `ImageCache: Failed to fetch single image: ${response.status} ${response.statusText}`
        );
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const data = await response.json();
      this.set(cacheKey, data, revalidate);

      console.log(`ImageCache: Cached image for ${vin}`);
      return data;
    } catch (error) {
      console.error("ImageCache: Error fetching image:", error);
      throw error;
    }
  }

  clear(vin?: string): void {
    if (vin) {
      // Clear all cache entries for a specific VIN
      for (const [key] of Array.from(this.cache.entries())) {
        if (key.includes(vin)) {
          this.cache.delete(key);
        }
      }
      console.log(`ImageCache: Cleared cache for VIN ${vin}`);
    } else {
      // Clear all cache
      this.cache.clear();
      console.log("ImageCache: Cleared all cache");
    }
  }

  clearImageList(vin: string): void {
    for (const [key] of Array.from(this.cache.entries())) {
      if (key.startsWith("imageList|") && key.includes(vin)) {
        this.cache.delete(key);
      }
    }
    console.log(`ImageCache: Cleared image list cache for VIN ${vin}`);
  }

  clearImage(vin: string): void {
    const cacheKey = this.generateKey("image", { vin });
    this.cache.delete(cacheKey);
    console.log(`ImageCache: Cleared image cache for VIN ${vin}`);
  }

  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const imageCacheService = new ImageCacheService();

// Export utility functions for backward compatibility
export function clearImageCache(vin?: string): void {
  imageCacheService.clear(vin);
}

export function clearImageListCache(vin: string): void {
  imageCacheService.clearImageList(vin);
}

export function clearImageCacheForVin(vin: string): void {
  imageCacheService.clear(vin);
}
