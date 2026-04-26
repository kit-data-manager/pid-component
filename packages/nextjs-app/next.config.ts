import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@kit-data-manager/pid-component',
    '@kit-data-manager/react-pid-component',
  ],
};

export default nextConfig;
