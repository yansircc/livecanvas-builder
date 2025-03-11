/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env.js'

/** @type {import("next").NextConfig} */
const config = {
  // Disable Next.js' built-in ESLint configuration since we're using a flat config
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default config
