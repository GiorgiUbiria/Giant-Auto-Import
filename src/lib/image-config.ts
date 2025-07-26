// Image optimization configuration for R2 bucket
export const imageConfig = {
  // R2 bucket configuration
  r2: {
    // Your R2 bucket public URL
    publicUrl: process.env.NEXT_PUBLIC_BUCKET_URL || '',
    
    // Image optimization service (choose one)
    optimization: {
      // Option 1: Cloudflare Images (recommended for R2)
      cloudflare: {
        enabled: !!process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_DOMAIN,
        domain: process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_DOMAIN || '',
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
        apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
      },
      
      // Option 2: ImageKit (alternative)
      imagekit: {
        enabled: !!process.env.NEXT_PUBLIC_IMAGEKIT_URL,
        url: process.env.NEXT_PUBLIC_IMAGEKIT_URL || '',
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
      },
      
      // Option 3: Custom optimization service
      custom: {
        enabled: !!process.env.NEXT_PUBLIC_CUSTOM_IMAGE_SERVICE,
        url: process.env.NEXT_PUBLIC_CUSTOM_IMAGE_SERVICE || '',
      }
    }
  },
  
  // Image quality settings
  quality: {
    thumbnail: 70,
    preview: 80,
    gallery: 85,
    fullscreen: 90,
    download: 95
  },
  
  // Format preferences (in order of preference)
  formats: ['webp', 'avif', 'jpeg'] as const,
  
  // Responsive breakpoints
  breakpoints: {
    mobile: 640,
    tablet: 1024,
    desktop: 1920,
    retina: 3840
  },
  
  // Caching settings
  cache: {
    // Browser cache duration (in seconds)
    browserCache: 60 * 60 * 24 * 7, // 7 days
    
    // CDN cache duration (in seconds)
    cdnCache: 60 * 60 * 24 * 30, // 30 days
    
    // Memory cache duration (in milliseconds)
    memoryCache: 5 * 60 * 1000, // 5 minutes
  },
  
  // Preloading settings
  preloading: {
    // Number of images to preload
    maxImages: 5,
    
    // Concurrency for preloading
    concurrency: 2,
    
    // Priority for preloading
    priority: 'low' as 'high' | 'low'
  },
  
  // Performance settings
  performance: {
    // Lazy loading threshold
    lazyThreshold: 0.1,
    
    // Intersection observer root margin
    rootMargin: '50px',
    
    // Debounce delay for resize events
    resizeDebounce: 150,
  }
};

// Helper function to get the active optimization service
export function getActiveOptimizationService() {
  if (imageConfig.r2.optimization.cloudflare.enabled) {
    return 'cloudflare';
  }
  if (imageConfig.r2.optimization.imagekit.enabled) {
    return 'imagekit';
  }
  if (imageConfig.r2.optimization.custom.enabled) {
    return 'custom';
  }
  return 'none';
}

// Helper function to get optimization URL
export function getOptimizationUrl(imageKey: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
  fit?: string;
}) {
  const service = getActiveOptimizationService();
  
  switch (service) {
    case 'cloudflare':
      const cfUrl = new URL(`https://${imageConfig.r2.optimization.cloudflare.domain}/${imageKey}`);
      if (options.width) cfUrl.searchParams.set('w', options.width.toString());
      if (options.height) cfUrl.searchParams.set('h', options.height.toString());
      if (options.quality) cfUrl.searchParams.set('q', options.quality.toString());
      if (options.format) cfUrl.searchParams.set('f', options.format);
      if (options.fit) cfUrl.searchParams.set('fit', options.fit);
      return cfUrl.toString();
      
    case 'imagekit':
      const ikUrl = new URL(`${imageConfig.r2.optimization.imagekit.url}/${imageKey}`);
      if (options.width) ikUrl.searchParams.set('w', options.width.toString());
      if (options.height) ikUrl.searchParams.set('h', options.height.toString());
      if (options.quality) ikUrl.searchParams.set('q', options.quality.toString());
      if (options.format) ikUrl.searchParams.set('f', options.format);
      return ikUrl.toString();
      
    case 'custom':
      const customUrl = new URL(`${imageConfig.r2.optimization.custom.url}/${imageKey}`);
      if (options.width) customUrl.searchParams.set('width', options.width.toString());
      if (options.height) customUrl.searchParams.set('height', options.height.toString());
      if (options.quality) customUrl.searchParams.set('quality', options.quality.toString());
      if (options.format) customUrl.searchParams.set('format', options.format);
      return customUrl.toString();
      
    default:
      // No optimization, return direct R2 URL with basic optimization hints
      const r2Url = new URL(`${imageConfig.r2.publicUrl}/${imageKey}`);
      
      // Add basic optimization parameters that might work with some R2 setups
      if (options.width) r2Url.searchParams.set('width', options.width.toString());
      if (options.height) r2Url.searchParams.set('height', options.height.toString());
      if (options.quality) r2Url.searchParams.set('quality', options.quality.toString());
      if (options.format) r2Url.searchParams.set('format', options.format);
      
      return r2Url.toString();
  }
} 