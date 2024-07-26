const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["oslo", "lucia"],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
       {
        protocol: "https",
        hostname: "giantautoimportimages.ec17bb88a597d2c1d369945a578a8403.r2.cloudflarestorage.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.mtlworld.win",
        port: "",
        pathname: "/api/content/**",
      },
      {
        protocol: "https",
        hostname: "admin.app.mtlworld.com",
        port: "",
        pathname: "/api/content/**",
      },
      {
        protocol: "https",
        hostname: "valetapp.pro",
        port: "",
        pathname: "/api/v1/s/**",
      },
    ],
  },
};

module.exports = withBundleAnalyzer(nextConfig)