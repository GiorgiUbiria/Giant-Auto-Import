import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push("@node-rs/argon2", "@node-rs/bcrypt");
    // Add webpack optimizations
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
    };
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
    ],
    // Configure image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Configure image formats
    formats: ['image/avif', 'image/webp'],
    // Configure minimum cache time
    minimumCacheTTL: 60,
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
};

export default withNextIntl(nextConfig);
