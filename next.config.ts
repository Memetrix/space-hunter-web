import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.PAGES === '1' ? '/space-hunter-web' : '',
  assetPrefix: process.env.PAGES === '1' ? '/space-hunter-web/' : undefined,
  images: { unoptimized: true },
};

export default nextConfig;
