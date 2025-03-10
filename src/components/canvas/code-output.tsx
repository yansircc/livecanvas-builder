'use client'

import { Check, Copy, Eye, FileCode } from 'lucide-react'
import { useCallback, useState } from 'react'
import { VersionSelector } from '@/components/canvas/version-selector'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
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
    <div
      className={cn(
        'h-full',
        'group relative overflow-hidden',
        'bg-white dark:bg-zinc-900',
        'border border-zinc-200 dark:border-zinc-800',
        'rounded-2xl transition-all duration-300 hover:shadow-md',
      )}
    >
      <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <FileCode className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">生成的代码</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">HTML 输出结果</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <VersionSelector />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openPreview}
              disabled={!code || isLoading}
              title="打开预览"
              className="h-8 rounded-xl border-zinc-200 px-3 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
            >
              <Eye className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              disabled={!code || isLoading}
              title={copied ? '已复制！' : '复制最终的HTML'}
              className="h-8 rounded-xl border-zinc-200 px-3 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="relative">
        {validationResult.errors.length > 0 && (
          <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
            <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/10 dark:text-red-300">
              <h3 className="mb-2 flex items-center gap-2 font-medium">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                验证错误
              </h3>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {validationResult.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="absolute inset-0 z-10" style={{ pointerEvents: 'none' }} />

        {isLoading ? (
          <div className="max-h-[calc(100vh-270px)] overflow-auto p-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4 rounded-md bg-zinc-100 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-full rounded-md bg-zinc-100 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-5/6 rounded-md bg-zinc-100 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-4/5 rounded-md bg-zinc-100 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-full rounded-md bg-zinc-100 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-3/4 rounded-md bg-zinc-100 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-5/6 rounded-md bg-zinc-100 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-full rounded-md bg-zinc-100 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-4/5 rounded-md bg-zinc-100 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-3/4 rounded-md bg-zinc-100 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-full rounded-md bg-zinc-100 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-5/6 rounded-md bg-zinc-100 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-4/5 rounded-md bg-zinc-100 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-full rounded-md bg-zinc-100 dark:bg-zinc-800" />
              <Skeleton className="h-4 w-3/4 rounded-md bg-zinc-100 dark:bg-zinc-800" />
            </div>
          </div>
        ) : (
          <div className="max-h-[calc(100vh-270px)] overflow-auto p-6">
            <div className="overflow-auto rounded-xl bg-zinc-50 p-4 dark:bg-zinc-950">
              <pre className="font-mono text-sm text-zinc-800 select-none dark:text-zinc-200">
                <code className="block">{code}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
