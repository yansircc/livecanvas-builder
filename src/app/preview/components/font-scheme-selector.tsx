'use client'

import { Check, ChevronDown, Type } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { fontSchemes } from '../config/style-presets'

interface FontSchemeSelectorProps {
  onChange: (schemeId: string) => void
  currentScheme: string
}

export function FontSchemeSelector({ onChange, currentScheme }: FontSchemeSelectorProps) {
  const [open, setOpen] = useState(false)
  // Use type assertion to ensure we always have a valid font scheme
  const selectedScheme = (fontSchemes.find((scheme) => scheme.id === currentScheme) ||
    fontSchemes[0]) as (typeof fontSchemes)[0]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 md:w-40">
          <Type className="h-4 w-4" />
          <span className="line-clamp-1 flex-1 text-left text-xs">{selectedScheme.name}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuRadioGroup value={currentScheme} onValueChange={onChange}>
          {fontSchemes.map((scheme) => (
            <DropdownMenuRadioItem
              key={scheme.id}
              value={scheme.id}
              className="flex items-center gap-2 py-2"
            >
              <div className="flex flex-col">
                <span className="text-xs font-medium" style={{ fontFamily: scheme.headingFont }}>
                  {scheme.name}
                </span>
                <span className="text-xs text-zinc-500" style={{ fontFamily: scheme.bodyFont }}>
                  {scheme.description}
                </span>
              </div>
              {currentScheme === scheme.id && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
