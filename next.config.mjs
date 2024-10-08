import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push("@node-rs/argon2", "@node-rs/bcrypt");
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["@node-rs/argon2", "nodemailer"],
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
        hostname: "pub-790f032d851548ee80b9672b151ea280.r2.dev",
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

export default withNextIntl(nextConfig);
