'use client'

import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ButtonCustomizer } from './components/ButtonCustomizer'
import { ColorSelector } from './components/ColorSelector'
import type { ButtonStyle } from './components/ComponentPreview'
import { FontSelector } from './components/FontSelector'
import { Header } from './components/Header'
import { PreviewPane } from './components/PreviewPane'
import { colorPresets } from './utils/colors'
import { defaultFonts } from './utils/fonts'
import { generateCSS, type ButtonRadius, type TailwindConfig } from './utils/generator'

// Available border radius presets
const radiusPresets: Record<string, string> = {
  none: '0',
  xs: '0.125rem',
  sm: '0.25rem',
  md: '0.375rem',
  base: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
}

export default function TailwindGenerator() {
  // State for colors
  const [primaryColor, setPrimaryColor] = useState(colorPresets[0]?.primary || '#3b82f6')
  const [secondaryColor, setSecondaryColor] = useState(colorPresets[0]?.secondary || '#06b6d4')
  const [accentColor, setAccentColor] = useState('#f471b5') // Default accent color

  // State for fonts
  const [headingFont, setHeadingFont] = useState(defaultFonts.heading)
  const [bodyFont, setBodyFont] = useState(defaultFonts.body)
  const [monoFont, setMonoFont] = useState(defaultFonts.mono)

  // State for button customization
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>('default')
  const [buttonRadius, setButtonRadius] = useState<ButtonRadius>('default')

  // State for system border radius
  const [systemRadius, setSystemRadius] = useState<string>('0.5rem')
  const [systemRadiusPreset, setSystemRadiusPreset] = useState<string>('base')

  // Handler for color changes
  const handleColorsChange = (primary: string, secondary: string, accent?: string) => {
    setPrimaryColor(primary)
    setSecondaryColor(secondary)
    if (accent) {
      setAccentColor(accent)
    }
  }

  // Handler for font changes
  const handleFontsChange = (heading: string, body: string, mono: string) => {
    setHeadingFont(heading)
    setBodyFont(body)
    setMonoFont(mono)
  }

  // Handler for button style changes
  const handleButtonStyleChange = (style: ButtonStyle) => {
    setButtonStyle(style)
  }

  // Handler for button radius changes
  const handleButtonRadiusChange = (radius: ButtonRadius) => {
    setButtonRadius(radius)
  }

  // Handler for system radius changes
  const handleSystemRadiusChange = (preset: string) => {
    setSystemRadiusPreset(preset)
    setSystemRadius(radiusPresets[preset] || '0.5rem')
  }

  // Configuration for CSS generation
  const cssConfig: TailwindConfig = {
    primaryColor,
    secondaryColor,
    accentColor,
    headingFont,
    bodyFont,
    monoFont,
    borderRadius: systemRadius,
    buttonStyle,
    buttonRadius,
  }

  // Copy CSS to clipboard
  const copyToClipboard = () => {
    void navigator.clipboard.writeText(generateCSS(cssConfig))
    toast.success('CSS has been copied to clipboard.')
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <Header />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Customize</h2>

            <div className="space-y-6">
              <ColorSelector
                onColorsChange={handleColorsChange}
                initialPrimary={primaryColor}
                initialSecondary={secondaryColor}
                initialAccent={accentColor}
              />

              <div className="border-t pt-6">
                <FontSelector
                  onFontsChange={handleFontsChange}
                  initialHeading={headingFont}
                  initialBody={bodyFont}
                  initialMono={monoFont}
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="mb-4 text-sm font-medium">System Border Radius</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Border Radius</Label>
                    <Select value={systemRadiusPreset} onValueChange={handleSystemRadiusChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select border radius" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(radiusPresets).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {key} ({value})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-muted-foreground mt-1 text-xs">
                      This sets the base border radius for your entire design system.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <ButtonCustomizer
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  selectedStyle={buttonStyle}
                  selectedRadius={buttonRadius}
                  onStyleChange={handleButtonStyleChange}
                  onRadiusChange={handleButtonRadiusChange}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="md:col-span-2">
          <PreviewPane
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            accentColor={accentColor}
            headingFont={headingFont}
            bodyFont={bodyFont}
            monoFont={monoFont}
            buttonStyle={buttonStyle}
            buttonRadius={buttonRadius}
            systemRadius={systemRadius}
            onCopyCSS={copyToClipboard}
          />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4" />
          <span>Tailwind CSS v4 generator for modern web applications</span>
        </div>
      </div>
    </div>
  )
}
