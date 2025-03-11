'use client'

import { Camera, FileCode } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PublishProjectDialog } from '@/components/publish-project-dialog'
import { Button } from '@/components/ui/button'
import { captureIframeScreenshot, testScreenshotCapture } from '@/lib/screenshot'
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
  const [isCapturing, setIsCapturing] = useState(false)

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

  // Get screenshot for publishing
  const getScreenshot = async (): Promise<string | null> => {
    try {
      // Force desktop view for screenshot
      const currentDevice = device
      if (currentDevice !== 'desktop') {
        // Temporarily switch to desktop for screenshot
        setDevice('desktop')
        // Wait for the device change to take effect
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      // Capture the screenshot
      const screenshot = await captureIframeScreenshot('iframe')

      // Restore original device if changed
      if (currentDevice !== 'desktop') {
        setDevice(currentDevice)
      }

      return screenshot
    } catch (error) {
      console.error('Failed to capture screenshot:', error)
      return null
    }
  }

  // Test screenshot capture
  const handleTestScreenshot = async () => {
    setIsCapturing(true)
    toast.info('正在截取屏幕...')

    try {
      const screenshot = await testScreenshotCapture('iframe', true)

      if (screenshot) {
        toast.success('截图成功！预览将显示 10 秒')

        // Create a download link
        const link = document.createElement('a')
        link.href = screenshot
        link.download = `screenshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`
        link.style.position = 'fixed'
        link.style.bottom = '10px'
        link.style.right = '10px'
        link.style.zIndex = '9999'
        link.style.background = '#0070f3'
        link.style.color = 'white'
        link.style.padding = '8px 16px'
        link.style.borderRadius = '4px'
        link.style.textDecoration = 'none'
        link.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)'
        link.textContent = '下载截图'

        document.body.appendChild(link)

        // Auto-remove after 10 seconds
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link)
          }
        }, 10000)
      } else {
        toast.error('截图失败，请查看控制台获取详细信息')
      }
    } catch (error) {
      console.error('Screenshot error:', error)
      toast.error('截图过程中发生错误')
    } finally {
      setIsCapturing(false)
    }
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
            {process.env.NODE_ENV === 'development' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestScreenshot}
                disabled={isCapturing}
                className="flex items-center gap-1"
              >
                <Camera className="h-4 w-4" />
                <span>测试截图</span>
              </Button>
            )}
            <CopyButton getContentToCopy={getContentToCopy} />
            <PublishProjectDialog htmlContent={content} getScreenshot={getScreenshot} />
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
