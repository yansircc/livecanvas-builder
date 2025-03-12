'use client'

import { Check, Code } from 'lucide-react'
import { useState } from 'react'
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
    <button
      type="button"
      onClick={handleCopy}
      disabled={isLoading}
      className={cn(
        'flex h-9 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-all',
        copied
          ? 'border border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/10 dark:text-green-400'
          : isLoading
            ? 'border border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500'
            : 'border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200',
      )}
      title={copied ? '已复制！' : '复制HTML代码'}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          <span>已复制！</span>
        </>
      ) : isLoading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          <span>复制中...</span>
        </>
      ) : (
        <>
          <Code className="h-4 w-4" />
          <span>复制HTML</span>
        </>
      )}
    </button>
  )
}
