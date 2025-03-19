import { hexToRgb, oklchToHex, rgbToOklch } from './colors-convert'
import { generateColorHarmonies } from './generate-color-harmonies'
import { generateColorShades } from './generate-color-shades'

/**
 * Generate a recommended color palette from a primary color
 *
 * @param primaryHex - The hex value of the primary color
 * @param harmonyType - The harmony type to use
 * @returns Object with primary, secondary, and accent colors and their recommended shades
 */
export function generateRecommendedPalette(primaryHex: string, harmonyType = '互补色') {
  const rgb = hexToRgb(primaryHex)
  const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b)

  // Get available harmonies
  const harmonies = generateColorHarmonies(oklch.h)

  // Ensure we have a default harmony
  const defaultHarmony = harmonies[0]
  if (!defaultHarmony) {
    throw new Error('没有可用的颜色和谐')
  }

  // Find the requested harmony or default to the first one
  const harmony = harmonies.find((h) => h.name === harmonyType) ?? defaultHarmony

  // Generate secondary and accent colors based on the harmony
  const secondaryHex = oklchToHex(oklch.l, oklch.c, harmony.secondary)

  const accentHex = oklchToHex(oklch.l, oklch.c, harmony.accent)

  return {
    harmony: harmony.name,
    description: harmony.description,
    combinations: harmony.combinations,
    colors: {
      primary: {
        hex: primaryHex,
        shades: generateColorShades(primaryHex),
      },
      secondary: {
        hex: secondaryHex,
        shades: generateColorShades(secondaryHex),
      },
      accent: {
        hex: accentHex,
        shades: generateColorShades(accentHex),
      },
    },
  }
}

/**
 * Get all available color harmonies
 */
export function getAvailableHarmonies(): string[] {
  return generateColorHarmonies(0).map((harmony) => harmony.name)
}
