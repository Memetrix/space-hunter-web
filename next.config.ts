import type { NextConfig } from "next";

const isProd = process.env.PAGES === '1';
const basePath = isProd ? '/space-hunter-web' : '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  assetPrefix: isProd ? '/space-hunter-web/' : undefined,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
