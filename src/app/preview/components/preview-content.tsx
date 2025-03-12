'use client'

import { FileCode } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PublishProjectDialog } from '@/components/publish-project-dialog'
import { captureIframeScreenshot } from '@/lib/screenshot'
import { IframeWrapper } from '@/utils/iframe-wrapper'
import { getOriginalContent, loadContentFromStorage } from '../utils/content-loader'
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
  const originalDeviceRef = useRef<DeviceType>('desktop')
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  // Create a unique key based on the full URL including hash
  const urlKey = typeof window !== 'undefined' ? window.location.href : ''

  // Load content on mount
  useEffect(() => {
    const htmlContent = loadContentFromStorage(contentId)
    setContent(htmlContent)
    setLoading(false)
  }, [contentId])

  // Store iframe reference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use a timeout to ensure the iframe is fully rendered
      setTimeout(() => {
        iframeRef.current = document.querySelector('iframe')
      }, 500)
    }
  }, [content, device])

  // Handle device change
  const handleDeviceChange = (newDevice: DeviceType) => {
    setDevice(newDevice)
    originalDeviceRef.current = newDevice
  }

  // Get content for copying
  const getContentToCopy = async (): Promise<string> => {
    // First try to get the original content from localStorage
    const originalContent = getOriginalContent(contentId)
    if (originalContent) {
      return originalContent
    }

    // If we couldn't get the original content, try to get it from the iframe
    const iframe = iframeRef.current || document.querySelector('iframe')!
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
      setIsCapturing(true)
      toast.info('正在准备截图...')

      // Store original device
      const currentDevice = originalDeviceRef.current

      // Force desktop view for screenshot if not already in desktop
      if (currentDevice !== 'desktop') {
        console.log('Switching to desktop view for screenshot')
        setDevice('desktop')

        // Wait for the device change to take effect
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // Ensure we have the latest iframe reference
      const iframe = document.querySelector('iframe')
      if (!iframe) {
        console.error('No iframe found for screenshot')
        toast.error('找不到预览框架，无法截图')
        return null
      }

      // Wait for iframe content to be fully loaded
      if (iframe.contentDocument?.readyState !== 'complete') {
        console.log('Waiting for iframe to fully load...')
        toast.info('等待页面加载完成...')

        // Wait for iframe to load
        await new Promise<void>((resolve) => {
          const handleLoad = () => resolve()
          iframe.addEventListener('load', handleLoad, { once: true })
          setTimeout(resolve, 2000) // Timeout after 2 seconds
        })
      }

      // Check if Bootstrap is loaded in the iframe
      const bootstrapLoaded =
        iframe.contentDocument?.querySelector('link[href*="bootstrap"]') !== null
      console.log('Bootstrap loaded in iframe:', bootstrapLoaded)

      // Check for images in the iframe
      const images = iframe.contentDocument?.querySelectorAll('img') || []
      console.log(`Found ${images.length} images in iframe`)

      // Wait for all images to load
      if (images.length > 0) {
        console.log('Waiting for images to load...')
        toast.info('等待图片加载完成...')

        // Create a promise for each image
        const imagePromises = Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve()
          return new Promise<void>((resolve) => {
            img.addEventListener('load', () => resolve(), { once: true })
            img.addEventListener('error', () => resolve(), { once: true }) // Resolve on error too
            // Add a timeout in case the image never loads
            setTimeout(resolve, 1000)
          })
        })

        // Wait for all images to load with a timeout
        await Promise.all(imagePromises)
      }

      // Wait a bit more to ensure all resources are loaded
      console.log('Waiting for resources to load...')
      toast.info('等待资源加载完成...')
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log('Capturing screenshot...')
      toast.info('正在截取屏幕...')

      // Capture the screenshot
      const screenshot = await captureIframeScreenshot('iframe')

      // Restore original device if changed
      if (currentDevice !== 'desktop') {
        console.log('Restoring original device view')
        setDevice(currentDevice)
      }

      if (screenshot) {
        console.log('Screenshot captured successfully')
        toast.success('截图成功！')
      } else {
        console.error('Screenshot capture returned null')
        toast.error('截图失败，请查看控制台获取详细信息')
      }

      return screenshot
    } catch (error) {
      console.error('Failed to capture screenshot:', error)
      toast.error('截图过程中发生错误')
      return null
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
            <CopyButton getContentToCopy={getContentToCopy} />
            <PublishProjectDialog
              htmlContent={content}
              getScreenshot={getScreenshot}
              isCapturingScreenshot={isCapturing}
            />
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
