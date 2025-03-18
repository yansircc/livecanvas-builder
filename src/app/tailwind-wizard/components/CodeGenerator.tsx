'use client'

import { Copy, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { generateCSS, type TailwindConfig } from '../utils/generator'

interface CodeGeneratorProps {
  config: TailwindConfig
}

export function CodeGenerator({ config }: CodeGeneratorProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const cssCode = generateCSS(config)

  const copyToClipboard = () => {
    void navigator.clipboard.writeText(cssCode)
    toast.success('CSS has been copied to clipboard.')
  }

  const previewWithCss = async () => {
    try {
      setIsSaving(true)

      // Store CSS in localStorage
      if (typeof window !== 'undefined') {
        // Use localStorage directly to save the CSS
        localStorage.setItem(
          'custom-css-storage',
          JSON.stringify({
            state: { customCss: cssCode },
            version: 0,
          }),
        )

        // Navigate to the preview page
        router.push('/preview?id=example')
        toast.success('Navigating to preview with your custom CSS...')
      }
    } catch (error) {
      console.error('Failed to save CSS for preview:', error)
      toast.error('Failed to save CSS for preview')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="relative">
      <div className="absolute top-2 right-2 flex gap-2">
        <Button variant="ghost" size="icon" onClick={copyToClipboard} title="Copy CSS">
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={previewWithCss}
          disabled={isSaving}
          title="Preview with this CSS"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
      <div className="border-b p-4">
        <h3 className="font-medium">globals.css</h3>
      </div>
      <pre className="bg-muted max-h-[500px] overflow-auto rounded-b-md p-6 text-sm">{cssCode}</pre>
    </Card>
  )
}
