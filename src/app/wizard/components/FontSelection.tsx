import { useEffect, useState } from 'react'
import { FONT_OPTIONS } from '../types'

interface FontSelectionProps {
  selectedFonts: {
    heading: string
    body: string
    mono: string
  }
  onFontChange: (type: 'heading' | 'body' | 'mono', font: string) => void
}

export function FontSelection({ selectedFonts, onFontChange }: FontSelectionProps) {
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set())

  // Load Google Fonts for preview
  useEffect(() => {
    // Create a function to load a font
    const loadFont = (fontName: string) => {
      if (loadedFonts.has(fontName)) return

      const link = document.createElement('link')
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;700&display=swap`
      link.rel = 'stylesheet'
      document.head.appendChild(link)

      // Add to loaded fonts
      setLoadedFonts((prev) => new Set([...prev, fontName]))
    }

    // Load all fonts for preview
    ;[...FONT_OPTIONS.heading, ...FONT_OPTIONS.body, ...FONT_OPTIONS.mono].forEach(loadFont)

    // Always load selected fonts to ensure they're available for preview
    loadFont(selectedFonts.heading)
    loadFont(selectedFonts.body)
    loadFont(selectedFonts.mono)
  }, [selectedFonts, loadedFonts])

  // Create font card component for consistent styling
  const FontCard = ({
    font,
    selected,
    type,
    sampleText,
  }: {
    font: string
    selected: boolean
    type: 'heading' | 'body' | 'mono'
    sampleText: string
  }) => (
    <button
      onClick={() => onFontChange(type, font)}
      className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-md border p-3 text-center transition-all hover:bg-gray-100 dark:hover:bg-zinc-900 ${
        selected
          ? 'border-zinc-500 bg-gray-100 dark:bg-zinc-950'
          : 'border-gray-200 hover:border-gray-300 dark:border-zinc-800 dark:hover:border-zinc-700'
      }`}
    >
      <div className="space-y-1">
        <div style={{ fontFamily: font }} className="text-sm font-medium">
          {font}
        </div>
        <div className="text-xs text-gray-500" style={{ fontFamily: font }}>
          {sampleText}
        </div>
      </div>
    </button>
  )

  return (
    <div className="grid gap-8">
      {/* Heading Font preview */}
      <div className="mt-4 rounded-md border border-gray-200 p-4">
        <div className="space-y-2" style={{ fontFamily: selectedFonts.heading }}>
          <h3 className="text-sm font-medium text-gray-500">标题字体:</h3>
          <h1 className="text-3xl font-bold">Heading 1</h1>
          <h2 className="text-2xl font-bold">Heading 2</h2>
          <h3 className="text-xl font-bold">Heading 3</h3>
        </div>
      </div>

      {/* Heading Fonts */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {FONT_OPTIONS.heading.map((font) => (
          <FontCard
            key={`heading-${font}`}
            font={font}
            selected={selectedFonts.heading === font}
            type="heading"
            sampleText="AaBbCc"
          />
        ))}
      </div>

      {/* Body Font preview */}
      <div className="mt-4 rounded-md border border-gray-200 p-4">
        <div style={{ fontFamily: selectedFonts.body }}>
          <h3 className="text-sm font-medium text-gray-500">正文字体:</h3>
          <p className="mt-2 text-base">
            This is a paragraph of text that shows the body font. The quick brown fox jumps over the
            lazy dog. It showcases how the font renders in normal text contexts.
          </p>
        </div>
      </div>

      {/* Body Fonts */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {FONT_OPTIONS.body.map((font) => (
          <FontCard
            key={`body-${font}`}
            font={font}
            selected={selectedFonts.body === font}
            type="body"
            sampleText="Paragraph"
          />
        ))}
      </div>

      {/* Monospace Font preview */}
      <div className="mt-4 rounded-md border border-gray-200 p-4">
        <div
          className="rounded bg-gray-100 p-3 dark:bg-zinc-900"
          style={{ fontFamily: selectedFonts.mono }}
        >
          <h3 className="mb-2 text-sm font-medium text-gray-500" style={{ fontFamily: 'inherit' }}>
            等宽字体:
          </h3>
          <code className="text-sm" style={{ fontFamily: 'inherit' }}>
            {'const sampleCode = (text) => {'}
            <br />
            {'  console.log(text);'}
            <br />
            {'  return text.toUpperCase();'}
            <br />
            {'};'}
          </code>
        </div>
      </div>

      {/* Monospace Fonts */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {FONT_OPTIONS.mono.map((font) => (
          <FontCard
            key={`mono-${font}`}
            font={font}
            selected={selectedFonts.mono === font}
            type="mono"
            sampleText="() => {}"
          />
        ))}
      </div>
    </div>
  )
}
