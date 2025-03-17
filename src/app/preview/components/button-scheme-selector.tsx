'use client'

import { Check, ChevronDown, Square } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { buttonSchemes } from '../config/style-presets'

interface ButtonSchemeSelectorProps {
  onChange: (schemeId: string) => void
  currentScheme: string
}

export function ButtonSchemeSelector({ onChange, currentScheme }: ButtonSchemeSelectorProps) {
  const [open, setOpen] = useState(false)
  // Use type assertion to ensure we always have a valid button scheme
  const selectedScheme = (buttonSchemes.find((scheme) => scheme.id === currentScheme) ||
    buttonSchemes[0]) as (typeof buttonSchemes)[0]

  // Get appropriate button style preview classes
  const getButtonPreviewClass = (style: string, size: string) => {
    let classes = 'inline-block border bg-primary text-white'

    // Add radius based on style
    if (style === 'pill') classes += ' rounded-full'
    else if (style === 'rounded') classes += ' rounded'
    else if (style === 'minimal') classes += ' rounded-sm'

    // Add size
    if (size === 'small') classes += ' px-2 py-1 text-xs'
    else if (size === 'medium') classes += ' px-3 py-1.5 text-xs'
    else if (size === 'large') classes += ' px-4 py-2 text-sm'

    return classes
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 md:w-40">
          <Square className="h-4 w-4" />
          <span className="line-clamp-1 flex-1 text-left text-xs">{selectedScheme.name}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuRadioGroup value={currentScheme} onValueChange={onChange}>
          {buttonSchemes.map((scheme) => (
            <DropdownMenuRadioItem
              key={scheme.id}
              value={scheme.id}
              className="flex items-center gap-2 py-2"
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium">{scheme.name}</span>
                <div
                  className={getButtonPreviewClass(scheme.style, scheme.size)}
                  style={{
                    boxShadow: scheme.shadow ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                    background:
                      scheme.style === 'gradient'
                        ? 'linear-gradient(to right, #0d6efd, #0a58ca)'
                        : '',
                  }}
                >
                  Button
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
