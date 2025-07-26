import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    config.externals.push("@node-rs/argon2", "@node-rs/bcrypt");
    
    // Optimize webpack configuration
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: false,
          vendors: false,
          commons: {
            name: 'commons',
            chunks: 'all',
            minChunks: 2,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const match = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/);
              return match ? `npm.${match[1].replace('@', '')}` : 'npm.unknown';
            },
          },
        },
      },
      // Add runtime chunk optimization
      runtimeChunk: 'single',
    };

    // Optimize for production
    if (!dev && !isServer) {
      config.optimization.minimize = true;
    }

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["@node-rs/argon2", "nodemailer"],
    optimizePackageImports: [
      '@radix-ui/react-icons',
      '@radix-ui/react-slot',
      'lucide-react',
      'react-icons',
    ],
    serverActions: {
      bodySizeLimit: '20mb',
    },
    // Add performance optimizations
    optimizeCss: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
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
  // Disable static optimization for error pages
  output: 'standalone',
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

export default withNextIntl(nextConfig);
