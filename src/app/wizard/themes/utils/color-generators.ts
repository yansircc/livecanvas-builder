import { derivedColor, extractHueFromOklch } from '../../utils/color-utils'
import { hexToRgb, rgbToOklch } from '../../utils/colors-convert'
import { type TailwindConfig } from '../types/theme-types'

/**
 * Extract color information from base colors for deriving additional colors
 */
export function extractColorInfo(config: TailwindConfig) {
  // Extract primary color info
  let primaryHue: number
  if (config.primaryColor.toLowerCase().startsWith('oklch(')) {
    const extractedHue = extractHueFromOklch(config.primaryColor)
    primaryHue = extractedHue !== null ? extractedHue : 0
  } else {
    const primaryRgb = hexToRgb(config.primaryColor)
    const primaryOklch = rgbToOklch(primaryRgb.r, primaryRgb.g, primaryRgb.b)
    primaryHue = primaryOklch.h
  }

  // Extract secondary color info
  let secondaryHue: number
  if (config.secondaryColor.toLowerCase().startsWith('oklch(')) {
    const extractedHue = extractHueFromOklch(config.secondaryColor)
    secondaryHue = extractedHue !== null ? extractedHue : 0
  } else {
    const secondaryRgb = hexToRgb(config.secondaryColor)
    const secondaryOklch = rgbToOklch(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b)
    secondaryHue = secondaryOklch.h
  }

  // Extract accent color info
  let accentHue: number
  if (config.accentColor.toLowerCase().startsWith('oklch(')) {
    const extractedHue = extractHueFromOklch(config.accentColor)
    accentHue = extractedHue !== null ? extractedHue : 0
  } else {
    const accentRgb = hexToRgb(config.accentColor)
    const accentOklch = rgbToOklch(accentRgb.r, accentRgb.g, accentRgb.b)
    accentHue = accentOklch.h
  }

  return { primaryHue, secondaryHue, accentHue }
}

/**
 * Generate UI color variables based on theme configuration
 */
export function generateUIColors(
  config: TailwindConfig,
  colorInfo: ReturnType<typeof extractColorInfo>,
) {
  const { primaryHue, secondaryHue, accentHue } = colorInfo

  // Create dynamic muted colors (based on primary but with lower saturation and higher lightness)
  const mutedColor = derivedColor(config.primaryColor, 0.96, 0.01)
  const mutedForeground = derivedColor(config.primaryColor, 0.55, 0.02)

  // accent UI colors (not accent color) - similar to muted but using accent hue
  const accentUIColor = derivedColor(config.accentColor, 0.96, 0.01)
  const accentUIForeground = derivedColor(config.accentColor, 0.22, 0.01)

  // Dynamic state colors for error, success, warning, info
  // destructive (for destructive actions) uses primary hue but adjusted to red range
  const destructiveHue =
    (primaryHue + 15) % 360 < 60 || (primaryHue + 15) % 360 > 330 ? 27 : primaryHue
  const destructiveColor = `oklch(0.57 0.25 ${destructiveHue.toFixed(1)})`

  // success uses secondary hue but adjusted to green range
  const successHue =
    (secondaryHue + 45) % 360 > 100 && (secondaryHue + 45) % 360 < 200 ? secondaryHue : 160
  const successColor = `oklch(0.56 0.15 ${successHue.toFixed(1)})`

  // warning uses a mixture of primary and secondary, adjusted to yellow/orange
  const warningHue =
    (primaryHue + secondaryHue) / 2 > 40 && (primaryHue + secondaryHue) / 2 < 100
      ? (primaryHue + secondaryHue) / 2
      : 80
  const warningColor = `oklch(0.75 0.18 ${warningHue.toFixed(1)})`

  // info uses complement of accent hue
  const infoHue = Math.abs((accentHue + 180) % 360)
  const infoColor = `oklch(0.66 0.18 ${infoHue.toFixed(1)})`

  // Dynamic background and foreground colors
  const backgroundColor = derivedColor(config.primaryColor, 0.98, 0.005)
  const foregroundColor = derivedColor(config.primaryColor, 0.15, 0.01)

  // Card and popover backgrounds
  const cardColor = derivedColor(config.primaryColor, 1, 0)
  const cardForegroundColor = foregroundColor
  const popoverColor = cardColor
  const popoverForegroundColor = cardForegroundColor

  // Dark mode colors
  const darkBackgroundColor = derivedColor(config.primaryColor, 0.15, 0.01)
  const darkForegroundColor = `oklch(0.98 0 0)`
  const darkCardColor = derivedColor(config.primaryColor, 0.18, 0.01)
  const darkCardForegroundColor = darkForegroundColor
  const darkPopoverColor = darkCardColor
  const darkPopoverForegroundColor = darkCardForegroundColor
  const darkMutedColor = derivedColor(config.primaryColor, 0.25, 0.01)
  const darkMutedForeground = derivedColor(config.primaryColor, 0.65, 0.02)
  const darkAccentUIColor = derivedColor(config.accentColor, 0.25, 0.01)
  const darkAccentUIForeground = darkForegroundColor

  // Border and input colors
  const borderColor = derivedColor(config.primaryColor, 0.89, 0.01)
  const inputColor = borderColor
  const darkBorderColor = derivedColor(config.primaryColor, 0.3, 0.01)
  const darkInputColor = darkBorderColor

  // Shadow colors
  const shadowColor = `color-mix(in oklch, ${derivedColor(config.primaryColor, 0.3, 0.05)}, transparent 90%)`
  const shadowColorMd = `color-mix(in oklch, ${derivedColor(config.primaryColor, 0.3, 0.05)}, transparent 85%)`
  const shadowColorLg = `color-mix(in oklch, ${derivedColor(config.primaryColor, 0.3, 0.05)}, transparent 80%)`
  const shadowColorXl = `color-mix(in oklch, ${derivedColor(config.primaryColor, 0.3, 0.05)}, transparent 75%)`

  // Dark shadows
  const darkShadowColor = `color-mix(in oklch, ${derivedColor(config.primaryColor, 0.1, 0.03)}, black 90%)`
  const darkShadowColorMd = `color-mix(in oklch, ${derivedColor(config.primaryColor, 0.1, 0.03)}, black 85%)`
  const darkShadowColorLg = `color-mix(in oklch, ${derivedColor(config.primaryColor, 0.1, 0.03)}, black 80%)`
  const darkShadowColorXl = `color-mix(in oklch, ${derivedColor(config.primaryColor, 0.1, 0.03)}, black 75%)`

  // Focus ring
  const ringColor = `color-mix(in oklch, ${config.primaryColor}, transparent 30%)`
  const ringColorOffset = 'white'
  const darkRingColorOffset = `color-mix(in oklch, ${darkBackgroundColor}, transparent 10%)`

  // Divider and state colors
  const dividerColor = derivedColor(config.primaryColor, 0.93, 0.01)
  const darkDividerColor = derivedColor(config.primaryColor, 0.27, 0.01)
  const hoverBgColor = derivedColor(config.primaryColor, 0.96, 0.01)
  const activeBgColor = derivedColor(config.primaryColor, 0.94, 0.015)
  const darkHoverBgColor = derivedColor(config.primaryColor, 0.2, 0.02)
  const darkActiveBgColor = derivedColor(config.primaryColor, 0.22, 0.03)

  return {
    // UI Colors
    mutedColor,
    mutedForeground,
    accentUIColor,
    accentUIForeground,

    // State Colors
    destructiveColor,
    successColor,
    warningColor,
    infoColor,

    // Background and Foreground
    backgroundColor,
    foregroundColor,

    // Card and Popover
    cardColor,
    cardForegroundColor,
    popoverColor,
    popoverForegroundColor,

    // Dark Mode Colors
    darkBackgroundColor,
    darkForegroundColor,
    darkCardColor,
    darkCardForegroundColor,
    darkPopoverColor,
    darkPopoverForegroundColor,
    darkMutedColor,
    darkMutedForeground,
    darkAccentUIColor,
    darkAccentUIForeground,

    // Border and Input
    borderColor,
    inputColor,
    darkBorderColor,
    darkInputColor,

    // Shadows
    shadowColor,
    shadowColorMd,
    shadowColorLg,
    shadowColorXl,
    darkShadowColor,
    darkShadowColorMd,
    darkShadowColorLg,
    darkShadowColorXl,

    // Ring and Focus
    ringColor,
    ringColorOffset,
    darkRingColorOffset,

    // Divider and State
    dividerColor,
    darkDividerColor,
    hoverBgColor,
    activeBgColor,
    darkHoverBgColor,
    darkActiveBgColor,
  }
}
