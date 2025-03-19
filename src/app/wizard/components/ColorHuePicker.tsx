'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

interface ColorHuePickerProps {
  hue: number
  onHueChange: (hue: number) => void
  selectedHarmony: string
  onHarmonyChange: (harmony: string) => void
  harmonies: string[]
  selectedColor?: string // Optional selected color
}

export function ColorHuePicker({
  hue,
  onHueChange,
  selectedHarmony,
  onHarmonyChange,
  harmonies,
  selectedColor,
}: ColorHuePickerProps) {
  // Use the selected color if provided, otherwise fall back to HSL
  const backgroundColor = selectedColor || `hsl(${hue}, 70%, 55%)`

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            style={{ backgroundColor }}
            className="h-14 w-14 rounded-md border border-gray-200"
          />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="text-sm font-semibold">色调 ({Math.round(hue)}°)</div>
          <Slider
            min={0}
            max={360}
            value={[hue]}
            onValueChange={(value) => onHueChange(value[0] ?? 0)}
            className="mt-2 w-full"
          />
          <div className="mt-3">
            <label htmlFor="harmony" className="mb-1 block text-sm font-medium">
              配色方案
            </label>
            <Select value={selectedHarmony} onValueChange={onHarmonyChange}>
              <SelectTrigger className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm">
                <SelectValue placeholder="选择一个配色方案" />
              </SelectTrigger>
              <SelectContent>
                {harmonies.map((harmony: string) => (
                  <SelectItem key={harmony} value={harmony}>
                    {harmony}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
