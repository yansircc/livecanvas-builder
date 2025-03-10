/* eslint-disable import/no-anonymous-default-export */
export default {
  // TypeScript, JavaScript files
  '*.{ts,tsx,js,jsx}': (files) => [
    'bun typecheck',
    `bun run format:check ${files.join(' ')}`,
    `bunx eslint --quiet --fix ${files.join(' ')}`,
  ],

  // Other files
  '*.{json,mdx}': (files) => [`bun run format:check ${files.join(' ')}`],

  // 明确忽略 tsbuildinfo 文件
  '!tsconfig.tsbuildinfo': [],
}
