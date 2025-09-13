// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const ISR_REVALIDATE_TIME = 60; // 60 seconds for ISR

interface ImageData {
  id: number;
  imageKey: string;
  imageType: "AUCTION" | "WAREHOUSE" | "DELIVERY" | "PICK_UP";
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
  private publicUrl = process.env.NEXT_PUBLIC_BUCKET_URL || "";

  private generateCacheKey(options: FetchOptions): string {
    const { vin, type, page = 1, pageSize = 12 } = options;
    return `${vin}:${type || "all"}:${page}:${pageSize}`;
  }

  private isCacheValid(entry: CacheEntry, revalidateTime: number = CACHE_DURATION): boolean {
    return Date.now() - entry.timestamp < revalidateTime;
  }

  private async fetchFromAPI(options: FetchOptions): Promise<{
    images: ImageData[];
    count: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { vin, type, page = 1, pageSize = 12 } = options;

    // Build query parameters
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());

    // Use environment variable if available, fallback to relative URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const url = baseUrl
      ? `${baseUrl}/api/images/${vin}?${params.toString()}`
      : `/api/images/${vin}?${params.toString()}`;
    console.log(`ImageCache (legacy): Using baseUrl: ${baseUrl}, final URL: ${url}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch images: ${response.statusText}`);
    }

    const data = await response.json();
    // Ensure shape conforms
    return {
      images: Array.isArray(data.images) ? data.images : [],
      count:
        typeof data.count === "number"
          ? data.count
          : Array.isArray(data.images)
            ? data.images.length
            : 0,
      totalPages: typeof data.totalPages === "number" ? data.totalPages : 1,
      currentPage: typeof data.currentPage === "number" ? data.currentPage : 1,
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

    // Fetch fresh data from API
    const freshData = await this.fetchFromAPI(options);

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
    keysToDelete.forEach((key) => this.cache.delete(key));
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
        chunk.map((url) => {
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
  getOptimizedUrl(
    imageKey: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: "webp" | "jpeg" | "png";
    } = {}
  ): string {
    const { width, height, quality = 80, format = "webp" } = options;
    const baseUrl = `${this.publicUrl}/${imageKey}`;

    // If no optimization parameters, return base URL
    if (!width && !height) {
      return baseUrl;
    }

    // Add optimization parameters
    const params = new URLSearchParams();
    if (width) params.append("w", width.toString());
    if (height) params.append("h", height.toString());
    params.append("q", quality.toString());
    params.append("f", format);

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
