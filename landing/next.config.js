/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.gelato-api.production' },
      { protocol: 'https', hostname: 'files.cdn.printful.com' },
      { protocol: 'https', hostname: 'product.gelatoapis.com' },
      { protocol: 'https', hostname: 'order.gelatoapis.com' },
      { protocol: 'https', hostname: 'ecommerce.gelatoapis.com' },
      { protocol: 'https', hostname: 'gelato-api-live.s3.eu-west-1.amazonaws.com' },
      { protocol: 'https', hostname: 'gelato-api-live.s3.amazonaws.com' },
      { protocol: 'https', hostname: '*.gelatocdn.com' },
      { protocol: 'https', hostname: 'gelatocdn.com' },
      { protocol: 'https', hostname: 'api.qrserver.com' },
      { protocol: 'https', hostname: 'www.quetz.org' },
    ],
  },
};
module.exports = nextConfig;
