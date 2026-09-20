import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  typedRoutes: true,
  experimental: {
    agentFeedback: true,
    inlineCss: true,
    useOffline: true,
  },
};

export default nextConfig;
