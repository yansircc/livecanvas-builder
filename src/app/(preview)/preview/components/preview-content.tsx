'use client'

import { FileCode } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PublishProjectDialog } from '@/components/publish-project-dialog'
import { getOriginalContent, loadContentFromStorage } from '../utils/content-loader'
import { IframeWrapper } from '../utils/iframe-wrapper'
import { CopyButton } from './copy-button'
import { deviceConfigs, DeviceSelector, type DeviceType } from './device-selector'
import { HashNavigationHandler } from './hash-navigation-handler'
import { LoadingSpinner } from './loading-spinner'
import { getIframeContent, PreviewFrame } from './preview-frame'

export function PreviewContent() {
  const searchParams = useSearchParams()
  const contentId = searchParams.get('id')
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [device, setDevice] = useState<DeviceType>('desktop')

  // Create a unique key based on the full URL including hash
  const urlKey = typeof window !== 'undefined' ? window.location.href : ''

  // Load content on mount
  useEffect(() => {
    const htmlContent = loadContentFromStorage(contentId)
    setContent(htmlContent)
    setLoading(false)
  }, [contentId])

  // Handle device change
  const handleDeviceChange = (newDevice: DeviceType) => {
    setDevice(newDevice)
  }

  // Get content for copying
  const getContentToCopy = async (): Promise<string> => {
    // First try to get the original content from localStorage
    const originalContent = getOriginalContent(contentId)
    if (originalContent) {
      return originalContent
    }

    // If we couldn't get the original content, try to get it from the iframe
    const iframe = document.querySelector('iframe')!
    const iframeContent = getIframeContent(iframe)

    // If we got content from the iframe, return it
    if (iframeContent) {
      return iframeContent
    }

    // Fallback to the iframe template
    return IframeWrapper(content)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const iframeContent = IframeWrapper(content)
  const currentDevice = deviceConfigs[device]

  return (
    <div key={urlKey} className="flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-900">
      {/* Header with title, device selector, and copy button */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white px-6 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="container mx-auto flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <FileCode className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </div>
              <div>
                <h1 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">HTML 预览</h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">查看生成的组件</p>
              </div>
            </div>
          </div>

          <DeviceSelector onDeviceChange={handleDeviceChange} initialDevice={device} />
          <div className="flex items-center gap-2">
            <CopyButton getContentToCopy={getContentToCopy} />
            <PublishProjectDialog htmlContent={content} />
          </div>
        </div>
      </header>

      {/* Preview frame */}
      <main className="flex-1 overflow-auto bg-zinc-100 dark:bg-zinc-900">
        <div className="container mx-auto min-h-[800px] px-4 py-8">
          <div className="h-full min-h-[800px]">
            <PreviewFrame
              content={iframeContent}
              deviceConfig={currentDevice}
              deviceType={device}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="container mx-auto px-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          <p>LiveCanvas Builder Preview</p>
        </div>
      </footer>

      {/* Hash navigation handler */}
      <HashNavigationHandler />
    </div>
  )
}
