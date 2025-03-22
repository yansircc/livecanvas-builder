/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env.js'

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    reactCompiler: true,
    dynamicIO: true,
    useCache: true,
  },
  // 将 serverComponentsExternalPackages 移到这里，修复配置错误
  serverExternalPackages: ['better-auth'],
  images: {
    remotePatterns: [
      {
        hostname: '*.unsplash.com',
      },
      {
        hostname: '*.vercel-storage.com',
      },
      {
        hostname: 'livecanvas-builder.b-cdn.net',
      },
    ],
  },
}

// 使用ESM格式导出
export default nextConfig
