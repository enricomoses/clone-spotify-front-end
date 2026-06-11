/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      '127.0.0.1',
      'localhost',
      'via.placeholder.com',
      'picsum.photos',
      'i.scdn.co',
      'misc.scdn.co',
    ],
    remotePatterns: [
      {
        hostname: 'res.cloudinary.com',
        protocol: 'https',
      },
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;
