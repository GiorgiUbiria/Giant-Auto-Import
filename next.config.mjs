/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["oslo", "lucia"],
  },
  images: {
    remotePatterns: [
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

export default nextConfig;
