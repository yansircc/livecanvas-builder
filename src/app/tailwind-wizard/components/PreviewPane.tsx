'use client'

import { Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { hexToRgb, rgbToOklch } from '../utils/colors-convert'
import type { ButtonRadius } from '../utils/generator'
import type { ButtonStyle } from './ComponentPreview'

interface PreviewPaneProps {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  headingFont: string
  bodyFont: string
  monoFont: string
  buttonStyle: ButtonStyle
  buttonRadius: ButtonRadius
  systemRadius: string
  onCopyCSS: () => void
}

// Generate shade previews that preserve the original hex color at 500
function generateShadePreview(baseHex: string): Record<string, string> {
  const rgb = hexToRgb(baseHex)
  const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b)

  // Generate all 11 shades (50-950) for comprehensive preview
  // Keep 500 as the original hex color for consistency
  return {
    '50': `oklch(0.97 ${(oklch.c * 0.15).toFixed(3)} ${oklch.h.toFixed(3)})`,
    '100': `oklch(0.95 ${(oklch.c * 0.25).toFixed(3)} ${oklch.h.toFixed(3)})`,
    '200': `oklch(0.90 ${(oklch.c * 0.35).toFixed(3)} ${oklch.h.toFixed(3)})`,
    '300': `oklch(0.85 ${(oklch.c * 0.5).toFixed(3)} ${oklch.h.toFixed(3)})`,
    '400': `oklch(0.75 ${(oklch.c * 0.8).toFixed(3)} ${oklch.h.toFixed(3)})`,
    '500': baseHex, // Preserve exact hex color for the base shade
    '600': `oklch(${(oklch.l * 0.85).toFixed(3)} ${(oklch.c * 0.95).toFixed(3)} ${oklch.h.toFixed(3)})`,
    '700': `oklch(${(oklch.l * 0.7).toFixed(3)} ${(oklch.c * 0.9).toFixed(3)} ${oklch.h.toFixed(3)})`,
    '800': `oklch(${(oklch.l * 0.55).toFixed(3)} ${(oklch.c * 0.8).toFixed(3)} ${oklch.h.toFixed(3)})`,
    '900': `oklch(${(oklch.l * 0.4).toFixed(3)} ${(oklch.c * 0.7).toFixed(3)} ${oklch.h.toFixed(3)})`,
    '950': `oklch(${(oklch.l * 0.25).toFixed(3)} ${(oklch.c * 0.6).toFixed(3)} ${oklch.h.toFixed(3)})`,
  }
}

// Get CSS radius value from ButtonRadius
function getRadiusValue(radius: ButtonRadius): string {
  switch (radius) {
    case 'none':
      return '0'
    case 'sm':
      return '0.125rem'
    case 'full':
      return '9999px'
    default:
      return '0.5rem'
  }
}

export function PreviewPane({
  primaryColor,
  secondaryColor,
  accentColor,
  headingFont,
  bodyFont,
  monoFont,
  buttonStyle,
  buttonRadius,
  systemRadius,
  onCopyCSS,
}: PreviewPaneProps) {
  // State for button hover demonstrations
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)

  // Fixed image URLs to prevent hydration errors
  const [cardImage, setCardImage] = useState('/images/placeholder/1.svg')
  const [secondImage, setSecondImage] = useState('/images/placeholder/2.svg')

  // Use useEffect to load random images only after hydration
  useEffect(() => {
    // These imports are safe inside useEffect (client-side only)
    void import('@/lib/unsplash').then(({ getUnsplashImage }) => {
      setCardImage(getUnsplashImage('architecture'))
      setSecondImage(getUnsplashImage('business'))
    })
  }, [])

  // Generate shade previews
  const primaryShades = generateShadePreview(primaryColor)
  const secondaryShades = generateShadePreview(secondaryColor)
  const accentShades = generateShadePreview(accentColor)

  // Get light and subtle versions for secondary and ghost buttons
  const primaryLight = primaryShades['100']
  const primaryVeryLight = primaryShades['50']

  // Button style CSS based on the selected style and radius
  const getButtonStyleCSS = (
    style: ButtonStyle,
    radius: ButtonRadius,
    isSecondary = false,
    isGhost = false,
    isHovered = false,
  ) => {
    // Determine radius value based on selection
    const radiusValue = getRadiusValue(radius)

    // For secondary button variation (with hover state)
    if (isSecondary) {
      return {
        backgroundColor: isHovered ? primaryVeryLight : 'transparent',
        color: primaryColor, // Use hex for exact color match
        borderColor: primaryColor,
        borderWidth: '1px',
        borderRadius: radiusValue,
        transition: 'background-color 0.2s',
      }
    }

    // For ghost button variation (with hover state)
    if (isGhost) {
      return {
        backgroundColor: isHovered ? primaryVeryLight : 'transparent',
        color: primaryColor, // Use hex for exact color match
        borderRadius: radiusValue,
        transition: 'background-color 0.2s',
      }
    }

    // Primary button styles (with hover states)
    switch (style) {
      case 'default':
        return {
          backgroundColor: isHovered ? primaryShades['600'] : primaryColor, // Use hex for exact match
          color: 'white',
          borderRadius: radiusValue,
          transition: 'background-color 0.2s',
        }
      case 'outline':
        return {
          backgroundColor: isHovered ? primaryVeryLight : 'transparent',
          color: primaryColor, // Use hex for exact color match
          borderColor: primaryColor,
          borderWidth: '1px',
          borderRadius: radiusValue,
          transition: 'background-color 0.2s',
        }
      case 'soft':
        return {
          backgroundColor: isHovered ? primaryShades['200'] : primaryLight,
          color: primaryShades['900'],
          borderRadius: radiusValue,
          transition: 'background-color 0.2s',
        }
      case 'gradient':
        return {
          background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`, // Use hex for exact match
          opacity: isHovered ? 0.9 : 1,
          color: 'white',
          borderRadius: radiusValue,
          transition: 'opacity 0.2s',
        }
    }
  }

  // Font-specific styles
  const headingStyle = { fontFamily: `'${headingFont}', sans-serif` }
  const bodyStyle = { fontFamily: `'${bodyFont}', sans-serif` }
  const monoStyle = { fontFamily: `'${monoFont}', monospace` }

  // Radius-specific styles
  const cardStyle = { borderRadius: systemRadius }
  const imageStyle = { borderRadius: systemRadius }

  return (
    <Card className="relative p-6">
      <Button
        variant="outline"
        size="sm"
        className="absolute top-4 right-4 flex items-center gap-1"
        onClick={onCopyCSS}
      >
        <Copy className="h-4 w-4" />
        <span>Copy CSS</span>
      </Button>

      <h2 className="mb-4 text-xl font-semibold">Preview</h2>

      <div className="space-y-8">
        {/* Color shades preview */}
        <div>
          <h3 className="mb-2 text-sm font-medium">Primary Color Shades</h3>
          <div className="grid grid-cols-11 gap-1">
            {Object.entries(primaryShades).map(([key, shade]) => (
              <div key={`primary-${key}`} className="flex-1">
                <div
                  className={`mb-1 h-10 rounded-md ${key === '500' ? 'ring-border ring-1' : ''}`}
                  style={{ backgroundColor: shade }}
                ></div>
                <p className="text-center text-xs">{key}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">Secondary Color Shades</h3>
          <div className="grid grid-cols-11 gap-1">
            {Object.entries(secondaryShades).map(([key, shade]) => (
              <div key={`secondary-${key}`} className="flex-1">
                <div
                  className={`mb-1 h-10 rounded-md ${key === '500' ? 'ring-border ring-1' : ''}`}
                  style={{ backgroundColor: shade }}
                ></div>
                <p className="text-center text-xs">{key}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">Accent Color Shades</h3>
          <div className="grid grid-cols-11 gap-1">
            {Object.entries(accentShades).map(([key, shade]) => (
              <div key={`accent-${key}`} className="flex-1">
                <div
                  className={`mb-1 h-10 rounded-md ${key === '500' ? 'ring-border ring-1' : ''}`}
                  style={{ backgroundColor: shade }}
                ></div>
                <p className="text-center text-xs">{key}</p>
              </div>
            ))}
          </div>
        </div>

        {/* System Radius Preview */}
        <div className="border-t pt-6">
          <h3 className="mb-4 text-sm font-medium">System Border Radius</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground mb-2 text-xs">Components with System Radius</p>
              <div className="space-y-2">
                <div className="bg-muted overflow-hidden" style={cardStyle}>
                  <div className="flex h-10 items-center justify-center">
                    Card with System Radius
                  </div>
                </div>
                <div className="overflow-hidden" style={imageStyle}>
                  <Image
                    src={secondImage}
                    alt="Preview"
                    width={400}
                    height={200}
                    className="h-24 w-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground mb-2 text-xs">Radius Values</p>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <div className="bg-muted flex h-16 items-center justify-center rounded-sm">
                    sm
                  </div>
                  <p className="text-center text-xs">--radius-sm</p>
                </div>
                <div className="space-y-1">
                  <div className="bg-muted flex h-16 items-center justify-center" style={cardStyle}>
                    base
                  </div>
                  <p className="text-center text-xs">--radius</p>
                </div>
                <div className="space-y-1">
                  <div className="bg-muted flex h-16 items-center justify-center rounded-lg">
                    lg
                  </div>
                  <p className="text-center text-xs">--radius-lg</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Component Previews */}
        <div className="border-t pt-6">
          <h3 className="mb-4 text-sm font-medium">Button Styles</h3>

          {/* Button Preview with Hover State */}
          <div className="mb-6 space-y-3">
            <p className="text-muted-foreground mb-2 text-xs">Button Style & Radius</p>
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1">
                <div
                  className="inline-flex items-center justify-center px-4 py-2"
                  style={getButtonStyleCSS(
                    buttonStyle,
                    buttonRadius,
                    false,
                    false,
                    hoveredButton === 'primary',
                  )}
                  onMouseEnter={() => setHoveredButton('primary')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  Primary Button
                </div>
                <p className="text-muted-foreground text-center text-xs">
                  {hoveredButton === 'primary' ? 'Hover' : 'Normal'}
                </p>
              </div>

              <div className="space-y-1">
                <div
                  className="inline-flex items-center justify-center px-4 py-2"
                  style={getButtonStyleCSS(
                    buttonStyle,
                    buttonRadius,
                    true,
                    false,
                    hoveredButton === 'secondary',
                  )}
                  onMouseEnter={() => setHoveredButton('secondary')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  Secondary Button
                </div>
                <p className="text-muted-foreground text-center text-xs">
                  {hoveredButton === 'secondary' ? 'Hover' : 'Normal'}
                </p>
              </div>

              <div className="space-y-1">
                <div
                  className="inline-flex items-center justify-center px-4 py-2"
                  style={getButtonStyleCSS(
                    buttonStyle,
                    buttonRadius,
                    false,
                    true,
                    hoveredButton === 'ghost',
                  )}
                  onMouseEnter={() => setHoveredButton('ghost')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  Ghost Button
                </div>
                <p className="text-muted-foreground text-center text-xs">
                  {hoveredButton === 'ghost' ? 'Hover' : 'Normal'}
                </p>
              </div>
            </div>
          </div>

          {/* Color Usage Preview */}
          <div className="mb-6">
            <p className="text-muted-foreground mb-2 text-xs">Color Usage Examples</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div
                  className="rounded-md p-4 text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <h4 className="mb-1 font-medium">Primary</h4>
                  <p className="text-xs opacity-90">Main action color</p>
                </div>
              </div>
              <div className="space-y-2">
                <div
                  className="rounded-md p-4 text-white"
                  style={{ backgroundColor: secondaryColor }}
                >
                  <h4 className="mb-1 font-medium">Secondary</h4>
                  <p className="text-xs opacity-90">Supporting color</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="rounded-md p-4 text-white" style={{ backgroundColor: accentColor }}>
                  <h4 className="mb-1 font-medium">Accent</h4>
                  <p className="text-xs opacity-90">Highlight color</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card Preview */}
          <div className="mb-6">
            <p className="text-muted-foreground mb-2 text-xs">Card Component</p>
            <Card style={cardStyle}>
              <CardHeader>
                <CardTitle style={headingStyle}>Card Title</CardTitle>
                <CardDescription>Using system border radius and fonts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 aspect-video overflow-hidden" style={imageStyle}>
                  <Image
                    src={cardImage}
                    alt="Preview"
                    width={600}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-sm" style={bodyStyle}>
                  Cards are containers that group related content and actions.
                </p>
                <div className="mt-4 flex gap-2">
                  <div
                    className="rounded-full px-2 py-1 text-xs text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Primary
                  </div>
                  <div
                    className="rounded-full px-2 py-1 text-xs text-white"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    Secondary
                  </div>
                  <div
                    className="rounded-full px-2 py-1 text-xs text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    Accent
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div
                  className="inline-flex items-center justify-center px-4 py-2"
                  style={getButtonStyleCSS(buttonStyle, buttonRadius, true)}
                >
                  Cancel
                </div>
                <div
                  className="inline-flex items-center justify-center px-4 py-2"
                  style={getButtonStyleCSS(buttonStyle, buttonRadius)}
                >
                  Submit
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Font Preview */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-sm font-medium">Font Preview</h3>
          <div className="space-y-3">
            <div>
              <p className="text-muted-foreground mb-1 text-xs">Heading Font</p>
              <p className="text-xl" style={headingStyle}>
                {headingFont}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-xs">Body Font</p>
              <p style={bodyStyle}>{bodyFont} - The quick brown fox jumps over the lazy dog.</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-xs">Mono Font</p>
              <p className="text-sm" style={monoStyle}>
                {monoFont} - const code = &quot;example&quot;;
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
