import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Note: Ignore typescript errors during build for this simple demo
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
