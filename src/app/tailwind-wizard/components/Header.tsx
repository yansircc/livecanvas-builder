'use client'

import { Palette } from 'lucide-react'

export function Header() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3">
        <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-md">
          <Palette className="text-primary-foreground h-5 w-5" />
        </div>
        <h1 className="text-3xl font-bold">Tailwind CSS v4 Generator</h1>
      </div>
      <p className="text-muted-foreground mt-3">
        Create a custom Tailwind CSS theme with an interactive wizard. Choose colors, fonts, and
        preview your design.
      </p>
    </div>
  )
}
