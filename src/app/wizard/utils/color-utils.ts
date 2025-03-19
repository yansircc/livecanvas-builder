/**
 * Color utilities for CSS generation
 * Handles conversion between color formats and color manipulation
 */

import { hexToRgb, oklchToHex, rgbToOklch } from './colors-convert'

/**
 * Extract hue value from an OKLCH color string
 */
export function extractHueFromOklch(oklchColor: string): number | null {
  try {
    // Handle various OKLCH formats:
    // oklch(0.5 0.2 270)
    // oklch(50% 0.2 270)
    // oklch(0.5, 0.2, 270)
    // oklch(50%, 0.2, 270)

    const spaceSeparated = oklchColor.match(/oklch\([^,]*\s+[^,\s]*\s+([^,\s)]+)/)
    const commaSeparated = oklchColor.match(/oklch\([^,]*,\s*[^,]*,\s*([^,)]+)/)

    if (spaceSeparated && spaceSeparated[1]) {
      return parseFloat(spaceSeparated[1])
    } else if (commaSeparated && commaSeparated[1]) {
      return parseFloat(commaSeparated[1])
    }
  } catch (error) {
    console.error(`Failed to extract hue from OKLCH: ${oklchColor}`, error)
  }

  // Default to blue (240) if extraction fails
  return 240
}

/**
 * Derive a color with specific lightness and chroma based on the hue of baseColor
 */
export function derivedColor(baseColor: string, lightness: number, chroma: number): string {
  try {
    // Handle OKLCH format
    if (
      baseColor &&
      typeof baseColor === 'string' &&
      baseColor.toLowerCase().startsWith('oklch(')
    ) {
      const hue = extractHueFromOklch(baseColor)
      if (hue !== null) {
        return `oklch(${lightness} ${chroma} ${hue.toFixed(1)})`
      }
    }

    // Handle HEX format
    if (baseColor && typeof baseColor === 'string' && baseColor.startsWith('#')) {
      const rgb = hexToRgb(baseColor)
      const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b)
      return `oklch(${lightness} ${chroma} ${oklch.h.toFixed(1)})`
    }
  } catch (e) {
    console.error(`Color derivation failed: ${baseColor}`, e)
  }

  // Default to a gray-blue if processing fails
  return `oklch(${lightness} ${chroma} 240)`
}

/**
 * Re-export underlying conversion functions for direct access
 */
export { hexToRgb, rgbToOklch, oklchToHex }
