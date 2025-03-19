/**
 * Normalize hue to the range [0, 360)
 */
export function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360
}
