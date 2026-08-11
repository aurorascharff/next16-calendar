import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  // partialPrefecthing: true,
  reactCompiler: true,
  typedRoutes: true,
  experimental: {
    instantInsights: {
      validationLevel: 'manual-warning',
    },
    inlineCss: true,
    useOffline: true,
  },
};

export default nextConfig;
