import { oklchToHex } from '../utils/colors-convert'

interface ColorDisplayProps {
  role: 'primary' | 'secondary' | 'accent'
  colorKey: string
  colorValue: string
  isRecommended: boolean
  indicatorColor: string
  indicatorLetter: string
}

export function ColorDisplay({
  colorKey,
  colorValue,
  isRecommended,
  indicatorColor,
}: ColorDisplayProps) {
  // Extract l, c, h values from the oklch string
  const match = colorValue.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/)
  // Handle the case where match might be null
  let l = 0,
    c = 0,
    hue = 0
  if (match && match.length >= 4) {
    l = parseFloat(match[1] || '0')
    c = parseFloat(match[2] || '0')
    hue = parseFloat(match[3] || '0')
  }
  const hexValue = oklchToHex(l, c, hue)

  return (
    <div
      style={{ backgroundColor: colorValue }}
      className={`group relative flex h-16 w-full flex-col items-center justify-center rounded-md transition-all hover:scale-105 ${
        isRecommended
          ? `ring-2 ring-${indicatorColor}-500 shadow-sm ring-offset-1`
          : 'hover:shadow-md'
      }`}
    >
      <span
        className={`text-sm font-bold ${parseInt(colorKey) > 500 ? 'text-white' : 'text-black'}`}
      >
        {colorKey}
      </span>
      <span
        className={`font-mono text-[8px] ${parseInt(colorKey) > 500 ? 'text-white/70' : 'text-black/70'}`}
      >
        {hexValue}
      </span>
    </div>
  )
}
