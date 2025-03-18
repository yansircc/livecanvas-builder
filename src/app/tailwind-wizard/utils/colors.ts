// Predefined color combinations with accent color
export const colorPresets = [
  {
    name: 'Blue Ocean',
    primary: '#2B0063',
    secondary: '#641303',
    accent: '#654300', // Pink accent
  },
  {
    name: 'Forest',
    primary: '#4F381A',
    secondary: '#511E2B',
    accent: '#3C1B4F', // Amber accent
  },
  {
    name: 'Sunset',
    primary: '#0B1B42',
    secondary: '#0E4A48',
    accent: '#471D0E', // Purple accent
  },
  {
    name: 'Royal',
    primary: '#5613DE',
    secondary: '#D7179D',
    accent: '#E61326', // Pink accent
  },
  {
    name: 'Earthy',
    primary: '#78716c',
    secondary: '#a16207',
    accent: '#0d9488', // Teal accent
  },
  {
    name: 'Berry',
    primary: '#d946ef',
    secondary: '#f43f5e',
    accent: '#6366f1', // Indigo accent
  },
  {
    name: 'Corporate',
    primary: '#0f172a',
    secondary: '#64748b',
    accent: '#0ea5e9', // Sky accent
  },
  {
    name: 'Vibrant',
    primary: '#f43f5e',
    secondary: '#8b5cf6',
    accent: '#eab308', // Yellow accent
  },
]

// Return the color with proper contrast for text
export function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)

  // Calculate luminance using the formula for perceived brightness
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? '#000000' : '#ffffff'
}
