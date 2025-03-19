import { generateButtonStyles } from '../utils/generate-button-styles'
import { generateColorShades } from '../utils/generate-color-shades'
import { type TailwindConfig } from './types/theme-types'
import { extractColorInfo, generateUIColors } from './utils/color-generators'
import {
  generateComponentStyles,
  generateDarkModeVariables,
  generateFontCSS,
  generateRootVariables,
  generateThemeVariables,
  generateUtilityClasses,
} from './utils/css-generators'

/**
 * Generate the complete Tailwind CSS v4 based on provided configuration
 */
export function generateTailwindV4CSS(config: TailwindConfig): string {
  // Use provided shade maps or generate them
  const primaryShades = config.primaryShades || generateColorShades(config.primaryColor)
  const secondaryShades = config.secondaryShades || generateColorShades(config.secondaryColor)
  const accentShades =
    config.accentShades || (config.accentColor ? generateColorShades(config.accentColor) : {})

  // Get base colors from selected shades or defaults
  const primaryBaseShade = config.primaryShade || '500'
  const secondaryBaseShade = config.secondaryShade || '500'
  const accentBaseShade = config.accentShade || '500'

  // Use the selected shade value as the base color
  const primaryBase = primaryShades[primaryBaseShade] || config.primaryColor
  const secondaryBase = secondaryShades[secondaryBaseShade] || config.secondaryColor
  const accentBase = accentShades[accentBaseShade] || config.accentColor || '#f471b5'
  const borderRadius = config.borderRadius || 'sm'

  // Extract color information for deriving other colors
  const colorInfo = extractColorInfo(config)

  // Generate UI colors
  const uiColors = generateUIColors(config, colorInfo)

  // Generate button styles CSS
  const buttonStyleCSS = generateButtonStyles(
    config.buttonStyle || 'default',
    primaryBase,
    secondaryBase,
    config.buttonRadius,
  )

  // Generate font CSS
  const fontCSS = generateFontCSS(config)

  // Generate component-specific styles
  const componentStyles = generateComponentStyles()

  // Generate the complete CSS
  return `/* 
 * Tailwind CSS v4 Configuration
 * This file contains all configuration for Tailwind CSS v4
 *
 * Note: @import 'tailwindcss'; syntax is specific to Tailwind CSS v4 local installation.
 * When using preview features or CDN version, the import will be handled automatically.
 */

@import 'tailwindcss';

${fontCSS}

@layer base {
${generateRootVariables(config, uiColors, primaryShades, secondaryShades, accentShades, primaryBase, secondaryBase, accentBase, borderRadius)}
}

@layer dark {
${generateDarkModeVariables(uiColors)}
}

@theme {
${generateThemeVariables()}
}

/* Custom button styles based on selected type */
${buttonStyleCSS}

/* Component-specific styles */
${componentStyles}

/* Utility classes for the design system */
${generateUtilityClasses()}

/* You can add additional custom styles here */
`
}
