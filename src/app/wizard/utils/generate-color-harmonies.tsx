import { normalizeHue } from './normalize-hue'

interface ColorHarmony {
  name: string
  description: string
  secondary: number
  accent: number
  combinations: {
    primary: string
    secondary: string
    accent: string
  }
}

/**
 * Generate harmonious color palettes based on color theory
 *
 * @param primaryHue - The hue value of the primary color (0-360)
 * @returns Array of color harmony options with secondary and accent hues
 */
export function generateColorHarmonies(primaryHue: number): ColorHarmony[] {
  const hue = normalizeHue(primaryHue)

  return [
    {
      name: '互补色',
      description: '高对比度和鲜艳的配色方案，使用颜色轮上的互补色',
      secondary: normalizeHue(hue + 30), // Slightly offset from primary
      accent: normalizeHue(hue + 180), // Opposite side of color wheel
      combinations: {
        primary: '500',
        secondary: '400',
        accent: '600',
      },
    },
    {
      name: '邻近色',
      description: '和谐且宁静的配色方案，使用颜色轮上的邻近色',
      secondary: normalizeHue(hue + 30),
      accent: normalizeHue(hue - 30),
      combinations: {
        primary: '500',
        secondary: '400',
        accent: '600',
      },
    },
    {
      name: '三角色',
      description: '平衡且鲜艳的配色方案，使用三个均匀间隔的颜色',
      secondary: normalizeHue(hue + 120),
      accent: normalizeHue(hue + 240),
      combinations: {
        primary: '500',
        secondary: '400',
        accent: '500',
      },
    },
    {
      name: '分裂色',
      description: '比互补色稍低，但仍然视觉有趣',
      secondary: normalizeHue(hue + 150),
      accent: normalizeHue(hue + 210),
      combinations: {
        primary: '500',
        secondary: '500',
        accent: '500',
      },
    },
    {
      name: '单色调',
      description: '微妙、精致，使用同一颜色的不同色调',
      secondary: hue, // Same hue, but we'll use different shade
      accent: hue, // Same hue, but we'll use different shade
      combinations: {
        primary: '500',
        secondary: '300',
        accent: '700',
      },
    },
  ]
}
