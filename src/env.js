import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    AI_HUB_MIX_API_KEY: z.string(),
    AI_HUB_MIX_ENDPOINT: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    DATABASE_URL: z.string(),
    PLUNK_API_KEY: z.string(),
    PLUNK_API_URL: z.string(),
    TRIGGER_SECRET_KEY: z.string(),
    OPENROUTER_API_KEY: z.string(),
    BLOB_READ_WRITE_TOKEN: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_IMAGE_PLACEHOLDER_PREFIX: z.string(),
    NEXT_PUBLIC_BETTER_AUTH_URL: z.string(),
    NEXT_PUBLIC_TAILWIND_CDN_URL: z.string(),
    NEXT_PUBLIC_TAILWIND_FALLBACK_PATH: z.string().default('/assets/js/tailwind-fallback.js'),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    AI_HUB_MIX_API_KEY: process.env.AI_HUB_MIX_API_KEY,
    AI_HUB_MIX_ENDPOINT: process.env.AI_HUB_MIX_ENDPOINT,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_IMAGE_PLACEHOLDER_PREFIX: process.env.NEXT_PUBLIC_IMAGE_PLACEHOLDER_PREFIX,
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    NEXT_PUBLIC_TAILWIND_CDN_URL: process.env.NEXT_PUBLIC_TAILWIND_CDN_URL,
    NEXT_PUBLIC_TAILWIND_FALLBACK_PATH:
      process.env.NEXT_PUBLIC_TAILWIND_FALLBACK_PATH || '/assets/js/tailwind-fallback.js',
    PLUNK_API_KEY: process.env.PLUNK_API_KEY,
    PLUNK_API_URL: process.env.PLUNK_API_URL,
    TRIGGER_SECRET_KEY: process.env.TRIGGER_SECRET_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
})
