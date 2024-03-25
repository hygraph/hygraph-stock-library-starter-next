/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "*.graphassets.com",
      },
      {
        hostname: "*.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
