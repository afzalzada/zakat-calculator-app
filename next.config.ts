
import type {NextConfig} from 'next';
import withPWA from '@ducanh2912/next-pwa';

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? '/zakat-calculator-app' : '',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  disable: !isProd,
  register: true,
  skipWaiting: true,
});

export default pwaConfig(nextConfig);
