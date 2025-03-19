import { hexToRgb, rgbToOklch } from './colors-convert'

// Generate color shades based on a base color (now using fixed lightness/chroma values)
export function generateColorShades(baseHex: string): Record<string, string> {
  const rgb = hexToRgb(baseHex)
  // Extract the hue from the base color
  const { h } = rgbToOklch(rgb.r, rgb.g, rgb.b)
  const hueValue = h.toFixed(3)

  // Tailwind uses a carefully calibrated scale of lightness and chroma values
  // that follow a specific pattern while maintaining the original hue:
  // - Lightness decreases from 50 to 950 (lighter to darker)
  // - Chroma increases from 50 to 700, then decreases to 950 (saturation peak at 700)
  return {
    '50': `oklch(0.980 0.013 ${hueValue})`, // Very light, minimal chroma
    '100': `oklch(0.936 0.032 ${hueValue})`, // Still very light
    '200': `oklch(0.885 0.062 ${hueValue})`, // Light with increasing chroma
    '300': `oklch(0.808 0.114 ${hueValue})`, // Medium light
    '400': `oklch(0.704 0.191 ${hueValue})`, // Medium with higher chroma
    '500': `oklch(0.637 0.237 ${hueValue})`, // Base medium shade
    '600': `oklch(0.577 0.245 ${hueValue})`, // Medium dark, near peak chroma
    '700': `oklch(0.505 0.213 ${hueValue})`, // Dark with high chroma
    '800': `oklch(0.444 0.177 ${hueValue})`, // Very dark with moderate chroma
    '900': `oklch(0.396 0.141 ${hueValue})`, // Very dark with lower chroma
    '950': `oklch(0.258 0.092 ${hueValue})`, // Extremely dark, low chroma
  }
}
