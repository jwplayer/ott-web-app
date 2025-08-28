import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev, isServer }) => {

    config.plugins.push(
      new (require('webpack').DefinePlugin)({
        __dev__: process.env.NODE_ENV === "development",
        __mode__: JSON.stringify(process.env.NODE_ENV || 'development'),
        __debug__: process.env.APP_TEST_DEBUG === '1',
      })
    );

    
    if (!isServer) {
      config.module.rules.push({
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: ['@svgr/webpack'],
      });
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dummyimage.com',
      },
    ],
  },

  generateBuildId: () => process.env.GIT_HASH || 'unknown',
};

export default nextConfig;
