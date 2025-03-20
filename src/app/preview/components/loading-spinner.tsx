'use client'

import { FileCode } from 'lucide-react'

export function LoadingSpinner() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md dark:bg-zinc-800">
          <FileCode className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-300"></div>
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">加载预览中...</h3>
          <p className="max-w-md text-sm text-zinc-500 dark:text-zinc-400">
            正在准备你的HTML预览，请稍候片刻
          </p>
        </div>
      </div>
    </div>
  )
}
