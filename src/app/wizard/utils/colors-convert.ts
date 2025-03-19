/**
 * Converts a hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove # if present
  hex = hex.replace(/^#/, '')

  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return { r, g, b }
}

/**
 * Converts RGB color values to OKLCH
 * Improved implementation for better accuracy
 */
export function rgbToOklch(r: number, g: number, b: number): { l: number; c: number; h: number } {
  // This is a simplified approximation - for production use a color library like culori or chroma.js
  // Convert to linear sRGB
  const srgbToLinear = (val: number): number => {
    val = val / 255
    return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  }

  const lr = srgbToLinear(r)
  const lg = srgbToLinear(g)
  const lb = srgbToLinear(b)

  // Convert to XYZ
  const x = 0.4124 * lr + 0.3576 * lg + 0.1805 * lb
  const y = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
  const z = 0.0193 * lr + 0.1192 * lg + 0.9505 * lb

  // Convert to LCH (simplified)
  // These are rough approximations - real implementation would require more steps
  const l = Math.cbrt(y)

  // Get chroma from distance in a*b* plane (simplified)
  const a = (x - y) * 5
  const bValue = (y - z) * 2
  const c = Math.sqrt(a * a + bValue * bValue) * 0.2

  // Get hue from a*b* coordinates
  let h = (Math.atan2(bValue, a) * 180) / Math.PI
  if (h < 0) h += 360

  return {
    l: Math.max(0, Math.min(1, l)),
    c: c,
    h: h,
  }
}

// This is a simplified approximation for oklch to hex conversion
export function oklchToHex(l: number, c: number, h: number): string {
  // Convert hue to radians
  const hRad = (h * Math.PI) / 180

  // Approximate a* and b* from LCH
  const a = c * Math.cos(hRad) * 5
  const bCoord = c * Math.sin(hRad) * 5

  // Convert to XYZ (simplified)
  const y = Math.pow(l, 3)
  const x = a / 5 + y
  const z = y - bCoord / 2

  // Convert to linear RGB
  const lr = 3.2406 * x - 1.5372 * y - 0.4986 * z
  const lg = -0.9689 * x + 1.8758 * y + 0.0415 * z
  const lb = 0.0557 * x - 0.204 * y + 1.057 * z

  // Convert to sRGB
  const linearToSrgb = (val: number): number => {
    return Math.max(
      0,
      Math.min(
        255,
        Math.round((val <= 0.0031308 ? val * 12.92 : 1.055 * Math.pow(val, 1 / 2.4) - 0.055) * 255),
      ),
    )
  }

  const r = linearToSrgb(lr)
  const g = linearToSrgb(lg)
  const blue = linearToSrgb(lb)

  // Convert to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`
}

// Convert hue to hex color using standardized lightness/chroma value
export function hueToHex(hue: number): string {
  // Use standard lightness/chroma values for consistent vibrant colors
  // We'll use the 500 shade values which is a good medium tone
  const l = 0.637
  const c = 0.237
  return oklchToHex(l, c, hue)
}
