'use client'

import { Check, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface ThemeOption {
  id: string
  name: string
  description: string
  primaryColor: string
  secondaryColor: string
}

// Predefined Bootstrap themes
export const themes: ThemeOption[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Standard Bootstrap theme',
    primaryColor: '#0d6efd',
    secondaryColor: '#6c757d',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Clean and minimal design',
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Dark interface theme',
    primaryColor: '#8b5cf6',
    secondaryColor: '#475569',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Professional look and feel',
    primaryColor: '#0369a1',
    secondaryColor: '#334155',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Vibrant and colorful design',
    primaryColor: '#ec4899',
    secondaryColor: '#8b5cf6',
  },
]

// Default theme to use as fallback
const DEFAULT_THEME = themes[0]

interface ThemeSelectorProps {
  onChange: (themeId: string) => void
  currentTheme: string
}

export function ThemeSelector({ onChange, currentTheme }: ThemeSelectorProps) {
  const [open, setOpen] = useState(false)
  // Find the selected theme or use the default theme
  const selectedTheme = themes.find((theme) => theme.id === currentTheme) || DEFAULT_THEME!

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 md:w-40">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: selectedTheme.primaryColor }}
          />
          <span className="line-clamp-1 flex-1 text-left text-xs">{selectedTheme.name}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuRadioGroup value={currentTheme} onValueChange={onChange}>
          {themes.map((theme) => (
            <DropdownMenuRadioItem
              key={theme.id}
              value={theme.id}
              className="flex items-center gap-2 py-2"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                <div className="flex flex-col">
                  <span className="text-xs font-medium">{theme.name}</span>
                  <span className="text-xs text-zinc-500">{theme.description}</span>
                </div>
              </div>
              {currentTheme === theme.id && <Check className="ml-2 h-4 w-4" />}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
