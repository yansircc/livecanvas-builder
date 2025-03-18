'use client'

import { Check } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { hexToRgb, rgbToOklch } from '../utils/colors-convert'
import type { ButtonRadius } from '../utils/generator'
import type { ButtonStyle } from './ComponentPreview'

interface ButtonCustomizerProps {
  primaryColor: string
  secondaryColor: string
  selectedStyle: ButtonStyle
  selectedRadius: ButtonRadius
  onStyleChange: (style: ButtonStyle) => void
  onRadiusChange: (radius: ButtonRadius) => void
}

const buttonStyles: Record<ButtonStyle, { name: string; description: string }> = {
  default: {
    name: 'Default',
    description: 'Solid background with high contrast',
  },
  outline: {
    name: 'Outline',
    description: 'Bordered with transparent background',
  },
  soft: {
    name: 'Soft',
    description: 'Light background with subtle contrast',
  },
  gradient: {
    name: 'Gradient',
    description: 'Gradient background from primary to secondary',
  },
}

const buttonRadiuses: Record<ButtonRadius, { name: string }> = {
  default: { name: 'Default' },
  sm: { name: 'Small' },
  none: { name: 'None' },
  full: { name: 'Rounded' },
}

// Convert hex to OKLCH CSS color value for consistent rendering
function hexToOklchColor(hex: string): string {
  const rgb = hexToRgb(hex)
  const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b)
  return `oklch(${oklch.l.toFixed(3)} ${oklch.c.toFixed(3)} ${oklch.h.toFixed(3)})`
}

export function ButtonCustomizer({
  primaryColor,
  secondaryColor,
  selectedStyle,
  selectedRadius,
  onStyleChange,
  onRadiusChange,
}: ButtonCustomizerProps) {
  // Convert hex colors to OKLCH for consistent rendering
  const primaryOklch = hexToOklchColor(primaryColor)
  const secondaryOklch = hexToOklchColor(secondaryColor)

  // Generate a lighter shade for the soft style
  const getLightShade = (color: string): string => {
    const rgb = hexToRgb(color)
    const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b)
    return `oklch(0.95 ${(oklch.c * 0.25).toFixed(3)} ${oklch.h.toFixed(3)})`
  }

  const primaryLight = getLightShade(primaryColor)
  const primaryDark = `oklch(${(rgbToOklch(hexToRgb(primaryColor).r, hexToRgb(primaryColor).g, hexToRgb(primaryColor).b).l * 0.7).toFixed(3)} ${rgbToOklch(hexToRgb(primaryColor).r, hexToRgb(primaryColor).g, hexToRgb(primaryColor).b).c.toFixed(3)} ${rgbToOklch(hexToRgb(primaryColor).r, hexToRgb(primaryColor).g, hexToRgb(primaryColor).b).h.toFixed(3)})`

  // Button style CSS based on the selected style
  const getButtonStyleCSS = (style: ButtonStyle, radius: ButtonRadius) => {
    // Get the radius value
    let radiusValue = '0.5rem' // default
    switch (radius) {
      case 'none':
        radiusValue = '0'
        break
      case 'sm':
        radiusValue = '0.125rem'
        break
      case 'full':
        radiusValue = '9999px'
        break
    }

    switch (style) {
      case 'default':
        return {
          backgroundColor: primaryOklch,
          color: 'white',
          borderRadius: radiusValue,
        }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: primaryOklch,
          borderColor: primaryOklch,
          borderWidth: '1px',
          borderRadius: radiusValue,
        }
      case 'soft':
        return {
          backgroundColor: primaryLight,
          color: primaryDark,
          borderRadius: radiusValue,
        }
      case 'gradient':
        return {
          background: `linear-gradient(to right, ${primaryOklch}, ${secondaryOklch})`,
          color: 'white',
          borderRadius: radiusValue,
        }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 text-sm font-medium">Button Style</h3>
        <RadioGroup
          value={selectedStyle}
          onValueChange={(value) => onStyleChange(value as ButtonStyle)}
          className="grid grid-cols-2 gap-4"
        >
          {Object.entries(buttonStyles).map(([style, { name, description }]) => (
            <div key={style} className="relative">
              <RadioGroupItem value={style} id={`button-style-${style}`} className="peer sr-only" />
              <Label
                htmlFor={`button-style-${style}`}
                className="border-muted bg-card hover:border-primary peer-data-[state=checked]:border-primary flex cursor-pointer flex-col gap-2 rounded-md border-2 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{name}</p>
                  <Check className="h-4 w-4 opacity-0 peer-data-[state=checked]:opacity-100" />
                </div>
                <div
                  className="flex h-10 items-center justify-center rounded-md text-sm"
                  style={getButtonStyleCSS(style as ButtonStyle, selectedRadius)}
                >
                  Button
                </div>
                <p className="text-muted-foreground text-xs">{description}</p>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="border-t pt-4">
        <h3 className="mb-4 text-sm font-medium">Button Radius</h3>
        <RadioGroup
          value={selectedRadius}
          onValueChange={(value) => onRadiusChange(value as ButtonRadius)}
          className="grid grid-cols-4 gap-2"
        >
          {Object.entries(buttonRadiuses).map(([radius, { name }]) => (
            <div key={radius} className="relative">
              <RadioGroupItem
                value={radius}
                id={`button-radius-${radius}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`button-radius-${radius}`}
                className="border-muted bg-card hover:border-primary peer-data-[state=checked]:border-primary flex cursor-pointer flex-col items-center gap-1 rounded-md border-2 p-2"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center"
                  style={getButtonStyleCSS(selectedStyle, radius as ButtonRadius)}
                >
                  <span className="text-xs">Aa</span>
                </div>
                <p className="text-xs">{name}</p>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}
