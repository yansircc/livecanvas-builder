import { ColorDisplay } from './ColorDisplay'

interface ColorSectionProps {
  title: string
  colors: Record<string, string>
  role: 'primary' | 'secondary' | 'accent'
  selectedShade: string
  indicatorColor: string
  indicatorLetter: string
  onShadeSelect?: (shade: string, role: 'primary' | 'secondary' | 'accent') => void
}

export function ColorSection({
  title,
  colors,
  role,
  selectedShade,
  indicatorColor,
  indicatorLetter,
  onShadeSelect,
}: ColorSectionProps) {
  const handleColorClick = (shade: string) => {
    if (onShadeSelect) {
      onShadeSelect(shade, role)
    }
  }

  return (
    <div className="space-y-2">
      <h2 className="mb-1 text-sm font-semibold">{title}</h2>
      <div className="rounded-md border border-gray-200">
        <div className="grid grid-cols-11 gap-2 p-3">
          {Object.entries(colors).map(([key, value]) => (
            <div
              key={`${role}-${key}`}
              onClick={() => handleColorClick(key)}
              className={onShadeSelect ? 'cursor-pointer' : ''}
            >
              <ColorDisplay
                role={role}
                colorKey={key}
                colorValue={value}
                isRecommended={key === selectedShade}
                indicatorLetter={indicatorLetter}
                indicatorColor={indicatorColor}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
