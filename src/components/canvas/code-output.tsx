'use client'

import { Check, Copy, Eye } from 'lucide-react'
import { useCallback, useState } from 'react'
import { VersionSelector } from '@/components/canvas/version-selector'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/use-app-store'
import { replaceImagePlaceholders } from '@/utils/replace-image-placeholders'

interface ValidationResult {
  valid: boolean
  errors: string[]
}

interface CodeOutputProps {
  code: string
  validationResult: ValidationResult
  isLoading?: boolean
}

export function CodeOutput({ code, validationResult, isLoading = false }: CodeOutputProps) {
  const [copied, setCopied] = useState(false)
  const { processedHtml } = useAppStore()

  const copyToClipboard = useCallback(async () => {
    try {
      // Get the code to copy
      let codeToCopy = processedHtml || code

      // Replace image placeholder paths with CDN URLs
      codeToCopy = replaceImagePlaceholders(codeToCopy)

      await navigator.clipboard.writeText(codeToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }, [processedHtml, code])

  const openPreview = () => {
    const contentId = Date.now().toString()
    localStorage.setItem(`preview_content_${contentId}`, processedHtml || code)
    window.open(`/preview?id=${contentId}`, '_blank')
  }

  return (
    <div className="h-full cursor-not-allowed overflow-hidden rounded-lg border">
      <div className="bg-muted/50 flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">生成的代码</h2>
        <div className="flex items-center gap-4">
          <VersionSelector />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openPreview}
              disabled={!code || isLoading}
              title="打开预览"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={copyToClipboard}
              disabled={!code || isLoading}
              title={copied ? '已复制！' : '复制最终的HTML'}
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="relative">
        {validationResult.errors.length > 0 && (
          <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-destructive/10 border-destructive text-destructive rounded-lg border p-4">
              <h3 className="mb-2 font-semibold">验证错误:</h3>
              <ul className="list-inside list-disc space-y-1">
                {validationResult.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="absolute inset-0 z-10" style={{ pointerEvents: 'none' }} />

        {isLoading ? (
          <div className="max-h-[calc(100vh-270px)] overflow-auto p-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ) : (
          <pre className="relative max-h-[calc(100vh-270px)] overflow-auto p-4 text-sm select-none">
            <code className="block">{code}</code>
          </pre>
        )}
      </div>
    </div>
  )
}
