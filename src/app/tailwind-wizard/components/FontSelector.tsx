'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { defaultFonts, fontOptions } from '../utils/fonts'

interface FontSelectorProps {
  onFontsChange: (heading: string, body: string, mono: string) => void
  initialHeading?: string
  initialBody?: string
  initialMono?: string
}

export function FontSelector({
  onFontsChange,
  initialHeading = defaultFonts.heading,
  initialBody = defaultFonts.body,
  initialMono = defaultFonts.mono,
}: FontSelectorProps) {
  const handleHeadingChange = (value: string) => {
    onFontsChange(value, initialBody, initialMono)
  }

  const handleBodyChange = (value: string) => {
    onFontsChange(initialHeading, value, initialMono)
  }

  const handleMonoChange = (value: string) => {
    onFontsChange(initialHeading, initialBody, value)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="heading-font">Heading Font</Label>
        <Select defaultValue={initialHeading} onValueChange={handleHeadingChange}>
          <SelectTrigger id="heading-font">
            <SelectValue placeholder="Select a heading font" />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.heading.map((font) => (
              <SelectItem key={font} value={font}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="body-font">Body Font</Label>
        <Select defaultValue={initialBody} onValueChange={handleBodyChange}>
          <SelectTrigger id="body-font">
            <SelectValue placeholder="Select a body font" />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.body.map((font) => (
              <SelectItem key={font} value={font}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="mono-font">Mono Font</Label>
        <Select defaultValue={initialMono} onValueChange={handleMonoChange}>
          <SelectTrigger id="mono-font">
            <SelectValue placeholder="Select a mono font" />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.mono.map((font) => (
              <SelectItem key={font} value={font}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
