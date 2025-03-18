'use client'

import { Code, HelpCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useCssStore } from '../stores/css-store'

interface CustomCssDialogProps {
  initialCss?: string
  onReloadPage?: () => void
}

export function CustomCssDialog({ initialCss = '', onReloadPage }: CustomCssDialogProps) {
  const { customCss, setCustomCss, clearCustomCss } = useCssStore()
  const [cssInput, setCssInput] = useState(customCss || initialCss)
  const [open, setOpen] = useState(false)
  const [autoReload, setAutoReload] = useState(true)
  const [showHelp, setShowHelp] = useState(false)

  const handleSave = () => {
    try {
      setCustomCss(cssInput)
      setOpen(false)

      if (autoReload) {
        // Force page reload to ensure CSS is properly applied
        if (onReloadPage) {
          onReloadPage()
        } else {
          window.location.reload()
        }
        toast.success('Custom CSS applied and page reloaded')
      } else {
        toast.success('Custom CSS applied')
      }
    } catch (error) {
      console.error('Error applying CSS:', error)
      toast.error('Error applying CSS')
    }
  }

  const handleClear = () => {
    clearCustomCss()
    setCssInput('')

    if (autoReload) {
      // Force page reload to reset CSS
      if (onReloadPage) {
        onReloadPage()
      } else {
        window.location.reload()
      }
      toast.info('Custom CSS has been cleared and page reloaded')
    } else {
      toast.info('Custom CSS has been cleared')
    }
  }

  const handleForceReload = () => {
    if (onReloadPage) {
      onReloadPage()
    } else {
      window.location.reload()
    }
    toast.info('Page reloaded to apply CSS changes')
  }

  const hasExistingCss = !!customCss

  const exampleCss = `@import 'tailwindcss';

@layer base {
  :root {
    /* Base colors in OKLCH format */
    --color-primary: oklch(0.5 0.2 240);
    --color-primary-foreground: oklch(0.98 0 0);
    --color-secondary: oklch(0.6 0.2 180);
    --color-secondary-foreground: oklch(0.98 0 0);
    
    /* Color shades - these are required for bg-primary-100 etc. */
    --primary-50: oklch(0.95 0.03 240);
    --primary-100: oklch(0.90 0.05 240);
    --primary-200: oklch(0.85 0.08 240);
    --primary-300: oklch(0.75 0.12 240);
    --primary-400: oklch(0.65 0.15 240);
    --primary-500: oklch(0.55 0.18 240);
    --primary-600: oklch(0.45 0.18 240);
    --primary-700: oklch(0.35 0.15 240);
    --primary-800: oklch(0.25 0.10 240);
    --primary-900: oklch(0.15 0.05 240);
    
    /* Same for secondary color */
    --secondary-50: oklch(0.95 0.03 180);
    --secondary-100: oklch(0.90 0.05 180);
    /* ... additional secondary shades ... */
    
    /* Typography */
    --font-sans: Inter, ui-sans-serif, system-ui;
  }
}`.trim()

  const exampleUsage = `
/* Example HTML using the color shades */
<div class="bg-primary-100 text-primary-900 p-4 rounded-lg">
  <h2 class="text-lg font-bold text-primary-800">Hello World</h2>
  <p class="text-primary-700">This is some text with primary colors.</p>
  <div class="bg-secondary-200 text-secondary-800 p-2 mt-2 rounded">
    Secondary color example
  </div>
  <button class="bg-primary-600 text-white px-4 py-2 rounded mt-2">
    Button with primary color
  </button>
</div>
  `.trim()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={hasExistingCss ? 'border-primary' : ''}>
          <Code className="mr-2 h-4 w-4" />
          {hasExistingCss ? 'Edit Custom CSS' : 'Custom CSS'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Custom CSS
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowHelp(!showHelp)}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="max-w-xs text-xs">
                    Show examples and help for using custom CSS with Tailwind
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogTitle>
          <DialogDescription>
            Paste your custom CSS code below to apply it to the preview. You can generate CSS using
            the Tailwind Wizard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            className="h-64 resize-none font-mono"
            placeholder="/* Paste your CSS here */
/* Make sure to include both base colors AND shade variables: */

@layer base {
  :root {
    /* Base colors */
    --color-primary: oklch(0.5 0.2 240);
    --color-secondary: oklch(0.6 0.2 180);

    /* Primary shades - required for bg-primary-100, etc. */
    --primary-100: oklch(0.9 0.05 240);
    --primary-500: oklch(0.55 0.18 240);
    --primary-900: oklch(0.15 0.05 240);
    
    /* Secondary shades */
    --secondary-100: oklch(0.9 0.05 180);
    /* ... etc ... */
  }
}"
            value={cssInput}
            onChange={(e) => setCssInput(e.target.value)}
          />

          {showHelp && (
            <div className="border-muted space-y-3 rounded-md border p-4">
              <h3 className="text-sm font-medium">Using Color Shades</h3>
              <p className="text-muted-foreground text-xs">
                For color shades to work properly, make sure your CSS includes both the base
                variables (--primary-100) and their mapping (--color-primary-100).
              </p>

              <div className="rounded-md bg-amber-50 p-3 text-xs dark:bg-amber-950">
                <h4 className="font-medium text-amber-800 dark:text-amber-300">Important Note</h4>
                <p className="mt-1 text-amber-700 dark:text-amber-400">
                  When pasting CSS from the Tailwind Wizard, we automatically fix variable mappings
                  for the preview. The system will add direct color mappings for each shade to
                  ensure compatibility.
                </p>
              </div>

              <h4 className="mt-3 text-xs font-medium">Example CSS with Shades:</h4>
              <pre className="bg-muted mt-1 max-h-40 overflow-y-auto rounded-md p-2 text-[10px] leading-tight">
                {exampleCss}
              </pre>

              <h4 className="mt-3 text-xs font-medium">Example Usage in HTML:</h4>
              <pre className="bg-muted mt-1 max-h-40 overflow-y-auto rounded-md p-2 text-[10px] leading-tight">
                {exampleUsage}
              </pre>

              <h4 className="mt-3 text-xs font-medium">Important Variables:</h4>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>
                  <code>--color-primary</code> - Base primary color for <code>bg-primary</code>
                </li>
                <li>
                  <code>--primary-100</code> - Primary shade definition (actual color value)
                </li>
                <li>
                  <code>--color-primary-100</code> - Color mapping that Tailwind uses
                </li>
                <li>
                  <code>--color-secondary</code> - Base secondary color
                </li>
                <li>
                  <code>--secondary-100</code> - Secondary shade definition
                </li>
              </ul>

              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full text-xs"
                onClick={() => setCssInput(exampleCss)}
              >
                Use Example CSS
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="auto-reload" className="cursor-pointer">
              Automatically reload page when applying CSS
            </Label>
            <Switch id="auto-reload" checked={autoReload} onCheckedChange={setAutoReload} />
          </div>

          {!autoReload && (
            <div className="bg-muted rounded-md p-3 text-sm">
              <p className="text-muted-foreground">
                <strong>Note:</strong> Without automatic reload, you may need to manually reload the
                page to see CSS changes applied correctly.
              </p>
            </div>
          )}
        </div>
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClear}>
              Clear CSS
            </Button>
            <Button variant="outline" onClick={handleForceReload}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload
            </Button>
          </div>
          <Button onClick={handleSave}>Apply Custom CSS</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
