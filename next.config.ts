import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false, // Bật ESLint trong build để phát hiện lỗi
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i1-kinhdoanh.vnecdn.net', // VnExpress images
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn2.tuoitre.vn', // Tuổi Trẻ images
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.vnecdn.net', // VnExpress CDN
        pathname: '/**',
      },
    ],
    unoptimized: true, // Tắt optimization cho external images (tránh lỗi)
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  webpack: (config, { dev }) => {
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
