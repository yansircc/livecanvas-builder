import { Circle, Square, SquareRoundCorner } from 'lucide-react'
import { useState, type CSSProperties } from 'react'
import { BORDER_RADII, BUTTON_STYLES, type BorderRadius, type ButtonStyle } from '../types'
import { hexToRgb } from '../utils/colors-convert'

interface ComponentStylesProps {
  buttonStyle: ButtonStyle
  borderRadius: BorderRadius
  color: string
  secondaryColor: string
  shades: Record<string, string>
  onButtonStyleChange: (style: ButtonStyle) => void
  onBorderRadiusChange: (radius: BorderRadius) => void
}

// Get appropriate icon for border radius
function getBorderRadiusIcon(radius: BorderRadius) {
  switch (radius) {
    case 'none':
      return <Square size={20} />
    case 'sm':
      return <SquareRoundCorner size={20} />
    case 'md':
    case 'lg':
      return <SquareRoundCorner size={20} />
    case 'full':
      return <Circle size={20} />
    default:
      return <SquareRoundCorner size={20} />
  }
}

export function ComponentStyles({
  buttonStyle,
  borderRadius,
  color,
  secondaryColor,
  shades,
  onButtonStyleChange,
  onBorderRadiusChange,
}: ComponentStylesProps) {
  // Add hover and active state tracking
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [activeButton, setActiveButton] = useState<string | null>(null)

  // Generate button style classes based on selected style and button type
  const getButtonClass = (
    style: ButtonStyle,
    type: 'primary' | 'secondary' | 'ghost' = 'primary',
  ) => {
    const radiusValue = BORDER_RADII.find((r) => r.value === borderRadius)?.css || '0.375rem'
    const isHovered = hoveredButton === `${style}-${type}`
    const isActive = activeButton === `${style}-${type}`

    // Common properties for all buttons
    const baseClasses =
      'flex h-10 items-center justify-center px-4 transition-all cursor-pointer select-none font-medium'

    switch (style) {
      case 'default': {
        if (type === 'primary') {
          return {
            base: `${baseClasses}`,
            style: {
              backgroundColor: isActive
                ? shades['700'] || color
                : isHovered
                  ? shades['600'] || color
                  : color,
              color: 'white',
              borderRadius: radiusValue,
              boxShadow: isActive
                ? '0 0 0 rgba(0, 0, 0, 0.1) inset'
                : isHovered
                  ? '0 2px 4px rgba(0, 0, 0, 0.1)'
                  : '0 1px 2px rgba(0, 0, 0, 0.05)',
              transform: isActive
                ? 'translateY(1px)'
                : isHovered
                  ? 'translateY(-1px)'
                  : 'translateY(0)',
              transition: 'all 0.2s ease-in-out',
            },
          }
        } else if (type === 'secondary') {
          return {
            base: `${baseClasses}`,
            style: {
              backgroundColor: isActive
                ? shades['100'] || 'rgba(0,0,0,0.08)'
                : isHovered
                  ? shades['50'] || 'rgba(0,0,0,0.03)'
                  : 'transparent',
              color: color,
              borderRadius: radiusValue,
              border: `1px solid ${color}`,
              transform: isActive
                ? 'translateY(1px)'
                : isHovered
                  ? 'translateY(-1px)'
                  : 'translateY(0)',
              transition: 'all 0.2s ease-in-out',
            },
          }
        } else {
          // ghost
          return {
            base: `${baseClasses}`,
            style: {
              backgroundColor: isActive
                ? shades['100'] || 'rgba(0,0,0,0.08)'
                : isHovered
                  ? shades['50'] || 'rgba(0,0,0,0.03)'
                  : 'transparent',
              color: color,
              borderRadius: radiusValue,
              transform: isActive
                ? 'translateY(1px)'
                : isHovered
                  ? 'translateY(-1px)'
                  : 'translateY(0)',
              transition: 'all 0.2s ease-in-out',
            },
          }
        }
      }
      case 'gradient': {
        if (type === 'primary') {
          return {
            base: `${baseClasses}`,
            style: {
              backgroundImage: `linear-gradient(to right, ${color}, ${secondaryColor})`,
              backgroundColor: 'transparent',
              color: 'white',
              borderRadius: radiusValue,
              opacity: isActive ? 0.8 : isHovered ? 0.9 : 1,
              boxShadow: isActive
                ? '0 1px 2px rgba(0, 0, 0, 0.1)'
                : isHovered
                  ? '0 3px 6px rgba(0, 0, 0, 0.1)'
                  : '0 1px 3px rgba(0, 0, 0, 0.1)',
              transform: isActive
                ? 'translateY(1px)'
                : isHovered
                  ? 'translateY(-1px)'
                  : 'translateY(0)',
              transition: 'all 0.2s ease-in-out',
              position: 'relative',
              zIndex: 1,
            },
          }
        } else if (type === 'secondary') {
          return {
            base: `${baseClasses}`,
            style: {
              backgroundColor: 'transparent',
              border: `1px solid ${color}`,
              borderRadius: radiusValue,
              color: color,
              position: 'relative',
              zIndex: 1,
              boxSizing: 'border-box',
              backgroundImage: `linear-gradient(${radiusValue}, white, white), linear-gradient(to right, ${color}, ${secondaryColor})`,
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              transform: isActive
                ? 'translateY(1px)'
                : isHovered
                  ? 'translateY(-1px)'
                  : 'translateY(0)',
              boxShadow: isActive ? 'none' : isHovered ? '0 2px 4px rgba(0, 0, 0, 0.05)' : 'none',
              transition: 'all 0.2s ease-in-out',
            },
          }
        } else {
          // ghost
          return {
            base: `${baseClasses}`,
            style: {
              backgroundColor: isActive
                ? shades['100'] || 'rgba(0,0,0,0.08)'
                : isHovered
                  ? shades['50'] || 'rgba(0,0,0,0.03)'
                  : 'transparent',
              backgroundImage: 'none',
              color: color,
              borderRadius: radiusValue,
              transform: isActive
                ? 'translateY(1px)'
                : isHovered
                  ? 'translateY(-1px)'
                  : 'translateY(0)',
              transition: 'all 0.2s ease-in-out',
            },
          }
        }
      }
      case '3d': {
        // Extract the color values for better contrast
        const colorRgb = hexToRgb(color)
        const isDark = (colorRgb.r + colorRgb.g + colorRgb.b) / 3 < 128

        // Calculate appropriate colors for border/shadow
        const shadowHex = isDark ? shades['800'] : shades['900']
        const textColor = isDark ? 'white' : 'black'
        const shadowSize = '2px'

        if (type === 'primary') {
          return {
            base: `${baseClasses}`,
            style: {
              backgroundColor: color,
              color: textColor,
              borderRadius: radiusValue,
              border: `2px solid ${shadowHex}`,
              boxShadow: isActive
                ? `0px 0px 0 0 ${shadowHex}`
                : isHovered
                  ? `1px 1px 0 0 ${shadowHex}`
                  : `${shadowSize} ${shadowSize} 0 0 ${shadowHex}`,
              position: 'relative',
              top: isActive ? '3px' : isHovered ? '2px' : '0',
              transition: 'all 0.2s',
            },
          }
        } else if (type === 'secondary') {
          return {
            base: `${baseClasses}`,
            style: {
              backgroundColor: 'white',
              color: color,
              borderRadius: radiusValue,
              border: `2px solid ${color}`,
              boxShadow: isActive
                ? `0px 0px 0 0 ${color}`
                : isHovered
                  ? `1px 1px 0 0 ${color}`
                  : `${shadowSize} ${shadowSize} 0 0 ${color}`,
              position: 'relative',
              top: isActive ? '3px' : isHovered ? '2px' : '0',
              transition: 'all 0.2s',
            },
          }
        } else {
          // ghost
          return {
            base: `${baseClasses}`,
            style: {
              backgroundColor: 'transparent',
              color: color,
              borderRadius: radiusValue,
              border: `2px dashed ${color}`,
              boxShadow: isActive
                ? `0px 0px 0 0 ${color}`
                : isHovered
                  ? `1px 1px 0 0 ${color}`
                  : `${shadowSize} ${shadowSize} 0 0 ${color}`,
              position: 'relative',
              top: isActive ? '3px' : isHovered ? '2px' : '0',
              transition: 'all 0.2s',
            },
          }
        }
      }
      default:
        return {
          base: baseClasses,
          style: {
            backgroundColor: color,
            color: 'white',
            borderRadius: radiusValue,
          },
        }
    }
  }

  return (
    <div className="space-y-4">
      <div className="mt-4">
        <div className="rounded-md border border-gray-200 p-4">
          <div className="mb-2 text-xs font-medium text-gray-500">按钮预览:</div>
          <div className="flex flex-wrap gap-4">
            {/* Primary button */}
            <div
              className={`${getButtonClass(buttonStyle, 'primary').base}`}
              style={getButtonClass(buttonStyle, 'primary').style as CSSProperties}
              onMouseEnter={() => setHoveredButton(`${buttonStyle}-primary`)}
              onMouseLeave={() => {
                setHoveredButton(null)
                setActiveButton(null)
              }}
              onMouseDown={() => setActiveButton(`${buttonStyle}-primary`)}
              onMouseUp={() => setActiveButton(null)}
            >
              Primary
            </div>

            {/* Secondary button */}
            <div
              className={`${getButtonClass(buttonStyle, 'secondary').base}`}
              style={getButtonClass(buttonStyle, 'secondary').style as CSSProperties}
              onMouseEnter={() => setHoveredButton(`${buttonStyle}-secondary`)}
              onMouseLeave={() => {
                setHoveredButton(null)
                setActiveButton(null)
              }}
              onMouseDown={() => setActiveButton(`${buttonStyle}-secondary`)}
              onMouseUp={() => setActiveButton(null)}
            >
              Secondary
            </div>

            {/* Ghost button */}
            <div
              className={`${getButtonClass(buttonStyle, 'ghost').base}`}
              style={getButtonClass(buttonStyle, 'ghost').style as CSSProperties}
              onMouseEnter={() => setHoveredButton(`${buttonStyle}-ghost`)}
              onMouseLeave={() => {
                setHoveredButton(null)
                setActiveButton(null)
              }}
              onMouseDown={() => setActiveButton(`${buttonStyle}-ghost`)}
              onMouseUp={() => setActiveButton(null)}
            >
              Ghost
            </div>
          </div>
        </div>
      </div>

      <label className="mb-1 block text-sm font-medium">按钮样式</label>
      <div className="grid grid-cols-3 gap-3">
        {BUTTON_STYLES.map((style) => (
          <button
            key={style}
            onClick={() => onButtonStyleChange(style)}
            className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-md border p-3 text-center transition-all hover:bg-gray-100 dark:hover:bg-zinc-900 ${
              buttonStyle === style
                ? 'border-zinc-500 bg-gray-100 dark:bg-zinc-950'
                : 'border-gray-200 hover:border-gray-300 dark:border-zinc-800 dark:hover:border-zinc-700'
            }`}
          >
            {style.charAt(0).toUpperCase() + style.slice(1)}
          </button>
        ))}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">边框半径</label>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {BORDER_RADII.map((radius) => (
            <button
              key={radius.value}
              onClick={() => onBorderRadiusChange(radius.value)}
              className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-md border p-3 text-center text-sm transition-all hover:bg-gray-100 dark:hover:bg-zinc-900 ${
                borderRadius === radius.value
                  ? 'border-zinc-500 bg-gray-100 dark:bg-zinc-950'
                  : 'border-gray-200 hover:border-gray-300 dark:border-zinc-800 dark:hover:border-zinc-700'
              }`}
            >
              {getBorderRadiusIcon(radius.value)}
              <span className="mt-1">{radius.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
