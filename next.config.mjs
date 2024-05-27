/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["oslo"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.mtlworld.win",
        port: "",
        pathname: "/api/content/**",
      },
    ],
  },
};

export default nextConfig;
