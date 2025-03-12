/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env.js'

/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    reactCompiler: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: '*.unsplash.com',
      },
      {
        hostname: 'assets.lummi.ai',
      },
      {
        hostname: 'livecanvas-builder.b-cdn.net',
      },
      {
        hostname: 'ui-avatars.com',
      },
    ],
  },
}

export default config
