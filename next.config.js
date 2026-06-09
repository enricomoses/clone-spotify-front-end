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
    unoptimized: true,
  },
  remotePatterns: [
    {
      hostname: 'res.cloudinary.com',
      protocol: 'https',
    },
  ],
};

module.exports = nextConfig;
