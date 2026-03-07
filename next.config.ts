import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  experimental: {
    optimizePackageImports: ['firebase', 'lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
