export const isCI =
  process.env.CI === 'true' ||
  process.env.GITHUB_ACTIONS === 'true' ||
  (process.env.NODE_ENV === 'production' &&
    Object.values(process.env).some((val) => val === 'CI_PLACEHOLDER'))
