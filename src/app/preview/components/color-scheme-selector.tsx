// src/app/preview/components/color-scheme-selector.tsx
'use client'

import { Check, ChevronDown, Palette } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { colorSchemes } from '../config/style-presets'

interface ColorSchemeSelectorProps {
  onChange: (schemeId: string) => void
  currentScheme: string
}

export function ColorSchemeSelector({ onChange, currentScheme }: ColorSchemeSelectorProps) {
  const [open, setOpen] = useState(false)
  const selectedScheme =
    colorSchemes.find((scheme) => scheme.id === currentScheme) ?? colorSchemes[0]!

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 md:w-40">
          <Palette className="h-4 w-4" />
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: selectedScheme.primaryColor }}
          />
          <span className="line-clamp-1 flex-1 text-left text-xs">{selectedScheme.name}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuRadioGroup value={currentScheme} onValueChange={onChange}>
          {colorSchemes.map((scheme) => (
            <DropdownMenuRadioItem
              key={scheme.id}
              value={scheme.id}
              className="flex items-center gap-2 py-2"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: scheme.primaryColor }}
                />
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{scheme.name}</span>
                  <span className="text-xs text-zinc-500">{scheme.description}</span>
                </div>
              </div>
              {currentScheme === scheme.id && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
