'use client'

import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { generateColorHarmonies, generateContentColor } from '../lib/color-utils'
import { generateThemeCSS } from '../lib/generate-theme'
import { useThemeStore } from '../store/use-theme-store'
import { ColorPalette } from './color-palette'
import { FontSelection } from './font-selection'

export function ThemeGenerator() {
  const {
    selectedColor,
    selectedFonts,
    selectedScheme,
    generatedCSS,
    setSelectedColor,
    setSelectedScheme,
    setGeneratedCSS,
    updateSettings,
  } = useThemeStore()

  const [recommendedSchemes, setRecommendedSchemes] = useState<
    Array<{
      name: string
      description: string
      colors: {
        primary: string
        secondary: string
        accent: string
      }
    }>
  >([])
  const [copySuccess, setCopySuccess] = useState(false)

  // Generate color schemes when a color is selected
  useEffect(() => {
    if (selectedColor) {
      // Generate color harmonies using the enhanced utility
      const harmonies = generateColorHarmonies(selectedColor)
      setRecommendedSchemes(harmonies)
    }
  }, [selectedColor])

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    setSelectedScheme(null) // Reset selected scheme when new color is picked
  }

  // Handle font changes
  const handleFontChange = (type: 'heading' | 'body' | 'mono', font: string) => {
    updateSettings({
      selectedFonts: {
        ...selectedFonts,
        [type]: font,
      },
    })
  }

  // Handle scheme selection
  const handleSchemeSelect = (schemeName: string) => {
    const selectedSchemeObj = recommendedSchemes.find((s) => s.name === schemeName)
    if (selectedSchemeObj) {
      setSelectedScheme(schemeName)
    }
  }

  // Generate the CSS for the theme
  const handleGenerateTheme = () => {
    if (!selectedColor) return

    // Find the selected color scheme
    let schemeColors = { primary: selectedColor, secondary: selectedColor, accent: selectedColor }

    if (selectedScheme) {
      const selectedSchemeObj = recommendedSchemes.find((s) => s.name === selectedScheme)
      if (selectedSchemeObj) {
        schemeColors = selectedSchemeObj.colors
      }
    } else if (recommendedSchemes.length > 0) {
      // Use the first scheme if none selected
      setSelectedScheme(recommendedSchemes[0]?.name || null)
      schemeColors = recommendedSchemes[0]?.colors || {
        primary: selectedColor,
        secondary: selectedColor,
        accent: selectedColor,
      }
    }

    const css = generateThemeCSS({
      colors: schemeColors,
      fonts: selectedFonts,
    })

    setGeneratedCSS(css)

    toast.success('主题生成成功！')
  }

  // Copy generated CSS to clipboard
  const handleCopyCSS = async () => {
    if (generatedCSS) {
      try {
        await navigator.clipboard.writeText(generatedCSS)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (err) {
        console.error('Failed to copy CSS:', err)
      }
    }
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="colors">颜色</TabsTrigger>
          <TabsTrigger value="fonts">字体</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <ColorPalette onColorSelect={handleColorSelect} selectedColor={selectedColor} />

          {selectedColor && recommendedSchemes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">推荐的颜色方案</h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {recommendedSchemes.map((scheme) => (
                  <Card
                    key={scheme.name}
                    className={`hover:border-primary cursor-pointer transition-all ${selectedScheme === scheme.name ? 'border-primary ring-primary ring-1' : ''}`}
                    onClick={() => handleSchemeSelect(scheme.name)}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{scheme.name}</CardTitle>
                      <CardDescription className="text-xs">{scheme.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex space-x-2">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-md border text-lg font-medium"
                          style={{
                            backgroundColor: scheme.colors.primary,
                            color: generateContentColor(scheme.colors.primary),
                          }}
                          title="Primary"
                        >
                          A
                        </div>
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-md border text-lg font-medium"
                          style={{
                            backgroundColor: scheme.colors.secondary,
                            color: generateContentColor(scheme.colors.secondary),
                          }}
                          title="Secondary"
                        >
                          A
                        </div>
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-md border text-lg font-medium"
                          style={{
                            backgroundColor: scheme.colors.accent,
                            color: generateContentColor(scheme.colors.accent),
                          }}
                          title="Accent"
                        >
                          A
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="fonts">
          <FontSelection selectedFonts={selectedFonts} onFontChange={handleFontChange} />
        </TabsContent>
      </Tabs>

      <div className="flex gap-4">
        <Button
          onClick={handleGenerateTheme}
          disabled={!selectedColor}
          className="w-full sm:w-auto"
        >
          生成主题
        </Button>

        {generatedCSS && (
          <Button onClick={handleCopyCSS} variant="outline" className="w-full sm:w-auto">
            {copySuccess ? '已复制！' : '复制 CSS'}
          </Button>
        )}
      </div>

      {generatedCSS && (
        <Card>
          <CardHeader>
            <CardTitle>生成的主题</CardTitle>
            <CardDescription>
              你的 UI 主题已准备就绪！复制下面的 CSS 以在你的项目中使用。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted max-h-96 overflow-auto rounded p-4">
              <pre className="text-sm">
                <code>{generatedCSS}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
