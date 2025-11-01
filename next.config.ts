import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/collections/all',
        destination: '/collection',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/shop',
        destination: '/collections/all',
        permanent: true,
      },
    ];
  },
  typescript: {
     ignoreBuildErrors: true,
  }
};

export default nextConfig;
