'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="h-8 w-8 rounded-full border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
    >
      <Sun className="h-4 w-4 scale-100 rotate-0 text-zinc-600 transition-all dark:scale-0 dark:-rotate-90 dark:text-zinc-400" />
      <Moon className="absolute h-4 w-4 scale-0 rotate-90 text-zinc-600 transition-all dark:scale-100 dark:rotate-0 dark:text-zinc-400" />
      <span className="sr-only">切换主题</span>
    </Button>
  )
}
