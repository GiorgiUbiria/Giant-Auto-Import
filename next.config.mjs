import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

// Bundle analyzer configuration - simplified to avoid top-level await
const withBundleAnalyzer = (config) => config;

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    config.externals.push("@node-rs/argon2", "@node-rs/bcrypt");

    // Fix for @tanstack/react-table module parsing
    config.module.rules.push({
      test: /node_modules\/@tanstack\/react-table/,
      type: 'javascript/auto',
    });

    // Add better error handling for undefined modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Fix for Vercel-specific module resolution issues
    config.resolve.alias = {
      ...config.resolve.alias,
      // Ensure proper module resolution for server actions
      '@/lib/auth': './src/lib/auth.ts',
      '@/lib/drizzle/db': './src/lib/drizzle/db.ts',
    };

    // Vercel-optimized webpack configuration
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: false,
          vendors: false,
          // React and React DOM
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            chunks: 'all',
            priority: 40,
          },
          // Next.js
          next: {
            test: /[\\/]node_modules[\\/](next)[\\/]/,
            name: 'next',
            chunks: 'all',
            priority: 30,
          },
          // UI Libraries
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|class-variance-authority|clsx|tailwind-merge)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 20,
          },
          // Data and Form Libraries
          data: {
            test: /[\\/]node_modules[\\/](@tanstack|react-hook-form|@hookform|zod)[\\/]/,
            name: 'data',
            chunks: 'all',
            priority: 15,
          },
          // Commons
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
            priority: 5,
          },
        },
      },
      // Vercel-specific runtime optimization
      runtimeChunk: false, // Disable runtime chunk for Vercel
      moduleIds: 'deterministic', // Better for Vercel caching
    };

    // Optimize for production
    if (!dev && !isServer) {
      config.optimization.minimize = true;
    }

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["@node-rs/argon2", "nodemailer", "@libsql/client"],
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@radix-ui/react-slot',
      'lucide-react',
      'react-icons',
      '@tanstack/react-table',
      '@tanstack/react-query',
      'react-hook-form',
      '@hookform/resolvers',
      'date-fns',
      'zod',
    ],
    serverActions: {
      bodySizeLimit: '20mb',
      allowedOrigins: ['giantautoimport.com', 'www.giantautoimport.com'],
    },
    // Performance optimizations
    optimizeCss: true,
    // Vercel-specific optimizations
    serverMinification: true,
    serverSourceMaps: false,
  },
  images: {
    // Enable image optimization
    unoptimized: false,
    // Configure remote patterns for external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'giantautoimportimages.ec17bb88a597d2c1d369945a578a8403.r2.cloudflarestorage.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-790f032d851548ee80b9672b151ea280.r2.dev',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.mtlworld.win',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'admin.app.mtlworld.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'valetapp.pro',
        port: '',
        pathname: '/**',
      },
      // Add Cloudflare Images domain if configured
      ...(process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_DOMAIN ? [{
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_DOMAIN,
        port: '',
        pathname: '/**',
      }] : []),
      // Add ImageKit domain if configured
      ...(process.env.NEXT_PUBLIC_IMAGEKIT_URL ? [{
        protocol: 'https',
        hostname: new URL(process.env.NEXT_PUBLIC_IMAGEKIT_URL).hostname,
        port: '',
        pathname: '/**',
      }] : []),
    ],
    // Configure image sizes for responsive loading
    deviceSizes: [90, 150, 320, 480, 640, 750, 828, 960, 1024, 1080, 1200, 1440, 1920, 2048, 2880, 3840],
    // Configure image formats with priority
    formats: ['image/avif', 'image/webp'],
    // Configure minimum cache time (7 days)
    minimumCacheTTL: 60 * 60 * 24 * 7,
    // Configure content disposition
    contentDispositionType: 'attachment',
    // Configure content security policy
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Enable SWC minification
  swcMinify: true,
  // Configure static page generation
  staticPageGenerationTimeout: 60,
  // Enable compression
  compress: true,
  // Configure caching
  poweredByHeader: false,
  // Configure chunk loading
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Vercel-specific optimizations
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  // Note: avoid 'standalone' on Vercel to ensure server actions bundle correctly
  // Add performance optimizations
  generateEtags: false, // Disable ETags for better caching
  // Add headers for better caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=30, stale-while-revalidate=60',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
