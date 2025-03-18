'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { colorPresets } from '../utils/colors'
import { hexToRgb, rgbToOklch } from '../utils/colors-convert'

interface ColorSelectorProps {
  onColorsChange: (primary: string, secondary: string, accent?: string) => void
  initialPrimary?: string
  initialSecondary?: string
  initialAccent?: string
}

// Convert a hex color to OKLCH CSS color value for accurate rendering
function hexToOklchColor(hex: string): string {
  const rgb = hexToRgb(hex)
  const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b)
  return `oklch(${oklch.l.toFixed(3)} ${oklch.c.toFixed(3)} ${oklch.h.toFixed(3)})`
}

export function ColorSelector({
  onColorsChange,
  initialPrimary = colorPresets[0]?.primary || '#3b82f6',
  initialSecondary = colorPresets[0]?.secondary || '#06b6d4',
  initialAccent = '#f471b5',
}: ColorSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState(0)
  const [primaryColor, setPrimaryColor] = useState(initialPrimary)
  const [secondaryColor, setSecondaryColor] = useState(initialSecondary)
  const [accentColor, setAccentColor] = useState(initialAccent)
  const [customPrimaryColor, setCustomPrimaryColor] = useState('#000000')
  const [customSecondaryColor, setCustomSecondaryColor] = useState('#000000')
  const [customAccentColor, setCustomAccentColor] = useState('#f471b5')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets')

  // Handle preset selection
  const handlePresetChange = (index: number) => {
    setSelectedPreset(index)
    const newPrimary = colorPresets[index]?.primary || '#000000'
    const newSecondary = colorPresets[index]?.secondary || '#000000'
    const newAccent = colorPresets[index]?.accent || '#f471b5'
    setPrimaryColor(newPrimary)
    setSecondaryColor(newSecondary)
    setAccentColor(newAccent)
    onColorsChange(newPrimary, newSecondary, newAccent)
  }

  // Handle custom color additions
  const handleAddCustomColors = () => {
    setPrimaryColor(customPrimaryColor)
    setSecondaryColor(customSecondaryColor)
    setAccentColor(customAccentColor)
    setSelectedPreset(-1) // -1 indicates custom selection
    onColorsChange(customPrimaryColor, customSecondaryColor, customAccentColor)
    setDialogOpen(false)
  }

  // Handle accent color changes
  const handleAccentColorChange = (value: string) => {
    setAccentColor(value)
    onColorsChange(primaryColor, secondaryColor, value)
  }

  return (
    <div className="space-y-2">
      <Tabs defaultValue="presets" onValueChange={(v) => setActiveTab(v as 'presets' | 'custom')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="presets">Color Presets</TabsTrigger>
          <TabsTrigger value="custom">Custom Colors</TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="pt-4">
          <div className="grid grid-cols-2 gap-3">
            {colorPresets.map((preset, index) => (
              <div
                key={preset.name}
                className={`cursor-pointer rounded-md border-2 p-3 transition-all ${
                  selectedPreset === index
                    ? 'border-primary'
                    : 'hover:border-muted-foreground border-transparent'
                }`}
                onClick={() => handlePresetChange(index)}
              >
                <div className="mb-2 flex gap-2">
                  <div
                    className="h-8 w-8 rounded-md"
                    style={{ backgroundColor: preset.primary }}
                  ></div>
                  <div
                    className="h-8 w-8 rounded-md"
                    style={{ backgroundColor: preset.secondary }}
                  ></div>
                  <div
                    className="h-8 w-8 rounded-md"
                    style={{ backgroundColor: preset.accent }}
                  ></div>
                </div>
                <p className="text-sm font-medium">{preset.name}</p>
              </div>
            ))}

            {/* Custom color option */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <div className="border-muted-foreground hover:border-primary flex h-[86px] cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-3">
                  <Plus className="text-muted-foreground mb-1 h-6 w-6" />
                  <p className="text-sm font-medium">Custom Colors</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Custom Colors</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-primary-color">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="custom-primary-color"
                        type="color"
                        value={customPrimaryColor}
                        onChange={(e) => setCustomPrimaryColor(e.target.value)}
                        className="h-10 w-12 p-1"
                      />
                      <Input
                        type="text"
                        value={customPrimaryColor}
                        onChange={(e) => setCustomPrimaryColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <div
                      className="mt-1 h-4 rounded-md"
                      style={{ backgroundColor: customPrimaryColor }}
                    ></div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-secondary-color">Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="custom-secondary-color"
                        type="color"
                        value={customSecondaryColor}
                        onChange={(e) => setCustomSecondaryColor(e.target.value)}
                        className="h-10 w-12 p-1"
                      />
                      <Input
                        type="text"
                        value={customSecondaryColor}
                        onChange={(e) => setCustomSecondaryColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <div
                      className="mt-1 h-4 rounded-md"
                      style={{ backgroundColor: customSecondaryColor }}
                    ></div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-accent-color">Accent Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="custom-accent-color"
                        type="color"
                        value={customAccentColor}
                        onChange={(e) => setCustomAccentColor(e.target.value)}
                        className="h-10 w-12 p-1"
                      />
                      <Input
                        type="text"
                        value={customAccentColor}
                        onChange={(e) => setCustomAccentColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                    <div
                      className="mt-1 h-4 rounded-md"
                      style={{ backgroundColor: customAccentColor }}
                    ></div>
                  </div>

                  <Button className="w-full" onClick={handleAddCustomColors}>
                    Apply Custom Colors
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4 pt-4">
          {/* Individual color adjustments */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => onColorsChange(e.target.value, secondaryColor, accentColor)}
                  className="h-10 w-12 p-1"
                />
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => onColorsChange(e.target.value, secondaryColor, accentColor)}
                  className="flex-1"
                />
              </div>
              <div className="mt-1 h-4 rounded-md" style={{ backgroundColor: primaryColor }}></div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => onColorsChange(primaryColor, e.target.value, accentColor)}
                  className="h-10 w-12 p-1"
                />
                <Input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => onColorsChange(primaryColor, e.target.value, accentColor)}
                  className="flex-1"
                />
              </div>
              <div
                className="mt-1 h-4 rounded-md"
                style={{ backgroundColor: secondaryColor }}
              ></div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent-color">Accent Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="accent-color"
                  type="color"
                  value={accentColor}
                  onChange={(e) => handleAccentColorChange(e.target.value)}
                  className="h-10 w-12 p-1"
                />
                <Input
                  type="text"
                  value={accentColor}
                  onChange={(e) => handleAccentColorChange(e.target.value)}
                  className="flex-1"
                />
              </div>
              <div className="mt-1 h-4 rounded-md" style={{ backgroundColor: accentColor }}></div>
            </div>
          </div>

          <p className="text-muted-foreground mt-2 text-xs">
            The accent color is used for highlighting elements and creating visual interest. Primary
            colors are used for main actions, secondary for supporting elements, and accent for
            highlights.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
