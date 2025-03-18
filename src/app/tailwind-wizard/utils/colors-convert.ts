// Convert hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove # if present
  hex = hex.replace(/^#/, '')

  // Parse as RGB
  const bigint = parseInt(hex, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  return { r, g, b }
}

// Convert RGB to OKLCH (simplified conversion for demonstration)
export function rgbToOklch(r: number, g: number, b: number): { l: number; c: number; h: number } {
  // Convert RGB to sRGB
  const sR = r / 255
  const sG = g / 255
  const sB = b / 255

  // Convert to linear RGB
  const linearR = sR <= 0.04045 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4)
  const linearG = sG <= 0.04045 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4)
  const linearB = sB <= 0.04045 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4)

  // Convert to XYZ
  const x = 0.4124 * linearR + 0.3576 * linearG + 0.1805 * linearB
  const y = 0.2126 * linearR + 0.7152 * linearG + 0.0722 * linearB
  const z = 0.0193 * linearR + 0.1192 * linearG + 0.9505 * linearB

  // Convert XYZ to Lab (approximation)
  const l = 0.4122 * y + 0.5 // Lightness

  // Calculate chroma
  const a = 0.5 * (x - y) // Red-green component
  const b2 = 0.2 * (y - z) // Yellow-blue component
  const c = Math.sqrt(a * a + b2 * b2) // Chroma

  // Calculate hue
  let h = Math.atan2(b2, a) * (180 / Math.PI)
  if (h < 0) h += 360 // Normalize hue to 0-360 range

  return { l, c, h }
}

// Convert hex to OKLCH string
export function hexToOklch(hex: string): string {
  const rgb = hexToRgb(hex)
  const { l, c, h } = rgbToOklch(rgb.r, rgb.g, rgb.b)
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(3)})`
}
