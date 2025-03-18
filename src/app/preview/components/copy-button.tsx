'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { replaceImagePlaceholders } from '@/utils/replace-image-placeholders'

interface CopyButtonProps {
  getContentToCopy: () => Promise<string>
}

export function CopyButton({ getContentToCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleCopy = async () => {
    if (isLoading || copied) return

    setIsLoading(true)
    try {
      // Get the content to copy
      const htmlContent = await getContentToCopy()

      // Replace image placeholder paths with CDN URLs
      const processedContent = replaceImagePlaceholders(htmlContent)

      // Copy to clipboard
      await navigator.clipboard.writeText(processedContent)

      // Show success state
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy HTML content:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      disabled={isLoading}
      className={cn(
        copied &&
          'border-green-200 bg-green-50 text-green-600 dark:border-green-800 dark:bg-green-900/10 dark:text-green-400',
      )}
      title={copied ? 'Copied!' : 'Copy HTML code'}
    >
      {copied ? (
        <Check className="h-4 w-4" />
      ) : isLoading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="sr-only md:not-sr-only md:ml-2">
        {copied ? 'Copied' : isLoading ? 'Copying...' : 'Copy'}
      </span>
    </Button>
  )
}
