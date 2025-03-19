'use client'

import { useEffect } from 'react'
import { useTailwindStore } from '../stores/tailwindStore'
import { BORDER_RADII, type BorderRadius, type ButtonRadius } from '../types'
import { hexToRgb, hueToHex, rgbToOklch } from '../utils/colors-convert'
import { generateColorShades } from '../utils/generate-color-shades'
import {
  generateRecommendedPalette,
  getAvailableHarmonies,
} from '../utils/generate-recommended-palette'
import { generateTailwindV4CSS } from '../utils/generate-tailwind-v4-css'
import { ColorHuePicker } from './ColorHuePicker'
import { ColorSection } from './ColorSection'
import { ComponentStyles } from './ComponentStyles'
import { ExportButton } from './ExportButton'
import { FontSelection } from './FontSelection'
import { ResetButton } from './ResetButton'
import { TailwindTabs } from './TailwindTabs'

// Default berry color for initialization
const berry = {
  name: 'Berry',
  primary: '#d946ef',
  secondary: '#f43f5e',
  accent: '#6366f1', // Indigo accent
}

// Helper function to convert BorderRadius to ButtonRadius
function mapBorderRadiusToButtonRadius(borderRadius: BorderRadius): ButtonRadius {
  switch (borderRadius) {
    case 'none':
      return 'none'
    case 'sm':
      return 'sm'
    case 'full':
      return 'full'
    default:
      return 'default'
  }
}

export function ColorShades() {
  // Use Zustand store instead of local state
  const {
    hue,
    selectedHarmony,
    shadeLevel,
    fonts,
    buttonStyle,
    borderRadius,
    setHue,
    setSelectedHarmony,
    setShadeLevel,
    setFont,
    setButtonStyle,
    setBorderRadius,
  } = useTailwindStore()

  const harmonies = getAvailableHarmonies()

  // Initialize the hue from the berry default color
  useEffect(() => {
    // 只在初始化或当用户没有自定义选择（hue为0）时，设置默认颜色
    if (hue === 0) {
      // 从默认的 berry 颜色提取色调
      const berryRgb = hexToRgb(berry.primary)
      const berryOklch = rgbToOklch(berryRgb.r, berryRgb.g, berryRgb.b)

      console.log('Initializing default hue:', berryOklch.h)
      setHue(berryOklch.h)
    } else {
      console.log('Using stored hue:', hue)
    }
  }, [hue, setHue])

  // Convert hue to hex for display
  const color = hueToHex(hue)

  // Generate color recommendation
  const recommendation = generateRecommendedPalette(color, selectedHarmony)

  // Update the shade levels when harmony changes
  useEffect(() => {
    setShadeLevel('primary', recommendation.combinations.primary)
    setShadeLevel('secondary', recommendation.combinations.secondary)
    setShadeLevel('accent', recommendation.combinations.accent)
  }, [
    recommendation.combinations.accent,
    recommendation.combinations.primary,
    recommendation.combinations.secondary,
    selectedHarmony,
    setShadeLevel,
  ])

  // Prepare shades with user-selected levels
  const primaryShade = shadeLevel.primary
  const secondaryShade = shadeLevel.secondary
  const accentShade = shadeLevel.accent

  const primaryShades = generateColorShades(color)
  const secondaryShades = generateColorShades(recommendation.colors.secondary.hex)
  const accentShades = generateColorShades(recommendation.colors.accent.hex)

  // Function to update all shade levels simultaneously
  const handleShadeChange = (value: string, role: 'primary' | 'secondary' | 'accent') => {
    setShadeLevel(role, value)
  }

  // Function to update fonts
  const handleFontChange = (type: 'heading' | 'body' | 'mono', font: string) => {
    setFont(type, font)
  }

  // Extract the selected shade colors
  const selectedPrimaryColor = primaryShades[primaryShade] || color
  const selectedSecondaryColor =
    secondaryShades[secondaryShade] || recommendation.colors.secondary.hex
  const selectedAccentColor = accentShades[accentShade] || recommendation.colors.accent.hex

  const config = {
    primaryColor: selectedPrimaryColor,
    secondaryColor: selectedSecondaryColor,
    accentColor: selectedAccentColor,
    headingFont: fonts.heading,
    bodyFont: fonts.body,
    monoFont: fonts.mono,
    borderRadius: borderRadius,
    buttonRadius: mapBorderRadiusToButtonRadius(borderRadius),
    buttonStyle: buttonStyle,
    primaryShades: primaryShades,
    secondaryShades: secondaryShades,
    accentShades: accentShades,
    primaryShade: primaryShade,
    secondaryShade: secondaryShade,
  }

  const cssCode = generateTailwindV4CSS(config)
  const borderRadiusLabel = BORDER_RADII.find((r) => r.value === borderRadius)?.label || 'Medium'

  // Prepare the content for each tab
  const colorsTabContent = (
    <>
      <ColorHuePicker
        hue={hue}
        onHueChange={setHue}
        selectedHarmony={selectedHarmony}
        onHarmonyChange={setSelectedHarmony}
        harmonies={harmonies}
        selectedColor={selectedPrimaryColor}
      />

      <div className="mb-3 text-sm text-gray-600">{recommendation.description}</div>

      <ColorSection
        title="主色"
        colors={primaryShades}
        role="primary"
        selectedShade={primaryShade}
        indicatorColor="blue"
        indicatorLetter="P"
        onShadeSelect={handleShadeChange}
      />

      <ColorSection
        title="辅助色"
        colors={secondaryShades}
        role="secondary"
        selectedShade={secondaryShade}
        indicatorColor="pink"
        indicatorLetter="S"
        onShadeSelect={handleShadeChange}
      />

      <ColorSection
        title="强调色"
        colors={accentShades}
        role="accent"
        selectedShade={accentShade}
        indicatorColor="indigo"
        indicatorLetter="A"
        onShadeSelect={handleShadeChange}
      />
    </>
  )

  const typographyTabContent = (
    <FontSelection selectedFonts={fonts} onFontChange={handleFontChange} />
  )

  const componentsTabContent = (
    <ComponentStyles
      buttonStyle={buttonStyle}
      borderRadius={borderRadius}
      color={selectedPrimaryColor}
      secondaryColor={selectedSecondaryColor}
      shades={primaryShades}
      onButtonStyleChange={setButtonStyle}
      onBorderRadiusChange={setBorderRadius}
    />
  )

  return (
    <>
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ResetButton />
        <ExportButton
          cssCode={cssCode}
          config={{
            primaryColor: selectedPrimaryColor,
            secondaryColor: selectedSecondaryColor,
            accentColor: selectedAccentColor,
            headingFont: fonts.heading,
            bodyFont: fonts.body,
            monoFont: fonts.mono,
            borderRadius: config.borderRadius,
            buttonStyle: buttonStyle,
          }}
          borderRadiusLabel={borderRadiusLabel}
        />
      </div>

      <TailwindTabs
        colorsTabContent={colorsTabContent}
        typographyTabContent={typographyTabContent}
        componentsTabContent={componentsTabContent}
      />
    </>
  )
}
