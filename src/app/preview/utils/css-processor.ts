/**
 * Extract CSS blocks with properly balanced braces
 */
export const extractCssBlock = (
  css: string,
  pattern: RegExp
): { match: string | null; content: string | null } => {
  const startMatch = pattern.exec(css);
  if (!startMatch) return { match: null, content: null };

  const startIndex = startMatch.index;
  const openingBraceIndex = css.indexOf("{", startIndex);
  if (openingBraceIndex === -1) return { match: null, content: null };

  let braceCount = 1;
  let currentIndex = openingBraceIndex + 1;

  while (braceCount > 0 && currentIndex < css.length) {
    const char = css[currentIndex];
    if (char === "{") braceCount++;
    if (char === "}") braceCount--;
    currentIndex++;
  }

  if (braceCount !== 0) return { match: null, content: null };

  const fullMatch = css.substring(startIndex, currentIndex);
  const content = css.substring(openingBraceIndex + 1, currentIndex - 1);

  return { match: fullMatch, content };
};

// Maximum safe length for CSS processing to prevent "Invalid string length" errors
const MAX_SAFE_CSS_LENGTH = 10000000; // 10MB should be a safe limit

/**
 * Process CSS from localStorage to properly format it for iframe injection
 */
export const processCss = (
  customCss: string | null
): {
  daisyThemeVars: string;
  tailwindDirectives: string;
  fontImports: string[];
  themeNames: string[];
} => {
  let daisyThemeVars = "";
  let tailwindDirectives = "";
  const fontImports: string[] = [];
  const themeNames: string[] = [];

  if (!customCss) {
    return { daisyThemeVars, tailwindDirectives, fontImports, themeNames };
  }

  // Safety check to prevent "Invalid string length" errors
  let processableCss = customCss;
  if (processableCss.length > MAX_SAFE_CSS_LENGTH) {
    console.warn(
      `CSS content too large (${processableCss.length} chars), truncating to prevent errors`
    );
    processableCss = processableCss.substring(0, MAX_SAFE_CSS_LENGTH);
  }

  // Extract font imports if any
  const fontImportRegex = /@import url\(['"]([^'"]+)['"]\);/g;
  let fontMatch: RegExpExecArray | null;
  fontMatch = fontImportRegex.exec(processableCss);
  while (fontMatch !== null) {
    if (fontMatch?.[1]) {
      fontImports.push(fontMatch[1]);
    }
    fontMatch = fontImportRegex.exec(processableCss);
  }

  // Extract DaisyUI theme variables (similar to test.css format)
  const themeRegex = /@plugin\s*"daisyui\/theme"\s*{([^}]*)}/g;
  let match: RegExpExecArray | null;

  match = themeRegex.exec(processableCss);
  while (match !== null) {
    const themeContent = match[1];
    if (!themeContent) continue;
    const nameMatch = /name:\s*'([^']*)'/.exec(themeContent);
    const defaultMatch = /default:\s*(true|false)/.exec(themeContent);
    // const prefersdarkMatch = /prefersdark:\s*(true|false)/.exec(themeContent)

    if (nameMatch?.[1]) {
      const themeName = nameMatch[1];
      const isDefault = defaultMatch && defaultMatch[1] === "true";
      // const isPrefersDark = prefersdarkMatch && prefersdarkMatch[1] === 'true'

      // Add theme name to the list
      themeNames.push(themeName);

      // Format variables similar to test.css
      let selector = ":root";

      // Add data-theme selector for all themes, not just non-light/dark ones
      if (isDefault) {
        selector = `:root, :root:has(input.theme-controller[value=${themeName}]:checked)`;
      }

      // Always add [data-theme=themeName] for all themes
      selector += `, [data-theme=${themeName}]`;

      // Extract all CSS variables
      let cssVars = "";
      const varRegex = /--[^:]+:[^;]+;/g;
      let varMatch: RegExpExecArray | null;
      varMatch = varRegex.exec(themeContent);
      while (varMatch !== null) {
        cssVars += `  ${varMatch[0]}\n`;
        varMatch = varRegex.exec(themeContent);
      }

      // Add color-scheme if present
      const colorSchemeMatch = /color-scheme:\s*'([^']*)'/.exec(themeContent);
      if (colorSchemeMatch?.[1]) {
        cssVars = `  color-scheme: ${colorSchemeMatch[1]};\n${cssVars}`;
      }

      daisyThemeVars += `${selector} {\n${cssVars}}\n`;
    }

    // Get next match
    match = themeRegex.exec(processableCss);
  }

  // Extract @theme, @layer components, @layer utilities directives with proper brace handling
  const themeDirective = extractCssBlock(processableCss, /@theme\s*{/);
  if (themeDirective.content) {
    tailwindDirectives += `@theme {\n${themeDirective.content}\n}\n\n`;
  }

  const componentsDirective = extractCssBlock(
    processableCss,
    /@layer\s+components\s*{/
  );
  if (componentsDirective.content) {
    tailwindDirectives += `@layer components {\n${componentsDirective.content}\n}\n\n`;
  }

  const utilitiesDirective = extractCssBlock(
    processableCss,
    /@layer\s+utilities\s*{/
  );
  if (utilitiesDirective.content) {
    tailwindDirectives += `@layer utilities {\n${utilitiesDirective.content}\n}\n\n`;
  }

  return { daisyThemeVars, tailwindDirectives, fontImports, themeNames };
};
