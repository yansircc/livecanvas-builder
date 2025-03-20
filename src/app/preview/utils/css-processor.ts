/**
 * Extract CSS blocks with properly balanced braces
 */
export const extractCssBlock = (
  css: string,
  pattern: RegExp,
): { match: string | null; content: string | null } => {
  const startMatch = pattern.exec(css)
  if (!startMatch) return { match: null, content: null }

  const startIndex = startMatch.index
  const openingBraceIndex = css.indexOf('{', startIndex)
  if (openingBraceIndex === -1) return { match: null, content: null }

  let braceCount = 1
  let currentIndex = openingBraceIndex + 1

  while (braceCount > 0 && currentIndex < css.length) {
    const char = css[currentIndex]
    if (char === '{') braceCount++
    if (char === '}') braceCount--
    currentIndex++
  }

  if (braceCount !== 0) return { match: null, content: null }

  const fullMatch = css.substring(startIndex, currentIndex)
  const content = css.substring(openingBraceIndex + 1, currentIndex - 1)

  return { match: fullMatch, content }
}

/**
 * Process CSS from localStorage to properly format it for iframe injection
 */
export const processCss = (
  customCss: string | null,
): {
  daisyThemeVars: string
  tailwindDirectives: string
  fontImports: string[]
  themeNames: string[]
} => {
  let daisyThemeVars = ''
  let tailwindDirectives = ''
  const fontImports: string[] = []
  const themeNames: string[] = []

  if (!customCss) {
    return { daisyThemeVars, tailwindDirectives, fontImports, themeNames }
  }

  // Extract font imports if any
  const fontImportRegex = /@import url\(['"]([^'"]+)['"]\);/g
  let fontMatch: RegExpExecArray | null
  while ((fontMatch = fontImportRegex.exec(customCss)) !== null) {
    if (fontMatch && fontMatch[1]) {
      fontImports.push(fontMatch[1])
    }
  }

  // Extract DaisyUI theme variables (similar to test.css format)
  const themeRegex = /@plugin\s*"daisyui\/theme"\s*{([^}]*)}/g
  let match: RegExpExecArray | null

  while ((match = themeRegex.exec(customCss)) !== null) {
    const themeContent = match[1]
    if (!themeContent) continue
    const nameMatch = /name:\s*'([^']*)'/.exec(themeContent)
    const defaultMatch = /default:\s*(true|false)/.exec(themeContent)
    // const prefersdarkMatch = /prefersdark:\s*(true|false)/.exec(themeContent)

    if (nameMatch && nameMatch[1]) {
      const themeName = nameMatch[1]
      const isDefault = defaultMatch && defaultMatch[1] === 'true'
      // const isPrefersDark = prefersdarkMatch && prefersdarkMatch[1] === 'true'

      // Add theme name to the list
      themeNames.push(themeName)

      // Format variables similar to test.css
      let selector = `:root`

      // Add data-theme selector for all themes, not just non-light/dark ones
      if (isDefault) {
        selector = `:root, :root:has(input.theme-controller[value=${themeName}]:checked)`
      }

      // Always add [data-theme=themeName] for all themes
      selector += `, [data-theme=${themeName}]`

      // Extract all CSS variables
      let cssVars = ''
      const varRegex = /--[^:]+:[^;]+;/g
      let varMatch: RegExpExecArray | null
      while ((varMatch = varRegex.exec(themeContent)) !== null) {
        cssVars += `  ${varMatch[0]}\n`
      }

      // Add color-scheme if present
      const colorSchemeMatch = /color-scheme:\s*'([^']*)'/.exec(themeContent)
      if (colorSchemeMatch && colorSchemeMatch[1]) {
        cssVars = `  color-scheme: ${colorSchemeMatch[1]};\n${cssVars}`
      }

      daisyThemeVars += `${selector} {\n${cssVars}}\n`
    }
  }

  // Extract @theme, @layer components, @layer utilities directives with proper brace handling
  const themeDirective = extractCssBlock(customCss, /@theme\s*{/)
  if (themeDirective.content) {
    tailwindDirectives += `@theme {\n${themeDirective.content}\n}\n\n`
  }

  const componentsDirective = extractCssBlock(customCss, /@layer\s+components\s*{/)
  if (componentsDirective.content) {
    tailwindDirectives += `@layer components {\n${componentsDirective.content}\n}\n\n`
  }

  const utilitiesDirective = extractCssBlock(customCss, /@layer\s+utilities\s*{/)
  if (utilitiesDirective.content) {
    tailwindDirectives += `@layer utilities {\n${utilitiesDirective.content}\n}\n\n`
  }

  return { daisyThemeVars, tailwindDirectives, fontImports, themeNames }
}
