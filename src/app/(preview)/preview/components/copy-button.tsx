'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { replaceImagePlaceholders } from '@/utils/replace-image-placeholders'

interface CopyButtonProps {
  getContentToCopy: () => Promise<string>
}

export function CopyButton({ getContentToCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
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
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="bg-secondary hover:bg-secondary/80 flex cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-medium"
      title={copied ? '已复制！' : '复制HTML代码'}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span>已复制！</span>
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          <span>复制代码</span>
        </>
      )}
    </button>
  )
}
