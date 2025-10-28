import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // CI/Vercel 빌드에서 ESLint 경고로 실패하지 않도록 무시
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
