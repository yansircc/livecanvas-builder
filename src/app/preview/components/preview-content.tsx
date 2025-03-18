'use client'

import { FileCode } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { env } from '@/env'
import { captureIframeScreenshot } from '@/lib/screenshot'
import { useCssStore } from '../stores/css-store'
import { loadContentFromStorage } from '../utils/content-loader'
import { processContentWithCustomCss, processTailwindContent } from '../utils/css-processor'
import { CopyButton } from './copy-button'
import { CustomCssDialog } from './custom-css-dialog'
import { deviceConfigs, DeviceSelector, type DeviceType } from './device-selector'
import { LoadingSpinner } from './loading-spinner'
import { PublishProjectDialog } from './publish-project-dialog'

export function PreviewContent() {
  const searchParams = useSearchParams()
  const contentId = searchParams.get('id')
  const [content, setContent] = useState<string>('')
  const [processedContent, setProcessedContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [device, setDevice] = useState<DeviceType>('desktop')
  const [iframeHeight, setIframeHeight] = useState<number>(600)
  const [isCapturing, setIsCapturing] = useState(false)
  const [uniqueKey, setUniqueKey] = useState<number>(Date.now()) // Used to force iframe reload
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const originalDeviceRef = useRef<DeviceType>('desktop')

  // Access custom CSS from store
  const { customCss } = useCssStore()

  // Load content on mount
  useEffect(() => {
    loadAndProcessContent()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-process content when custom CSS changes
  useEffect(() => {
    loadAndProcessContent()
  }, [customCss]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadAndProcessContent = () => {
    try {
      const htmlContent = loadContentFromStorage(contentId)
      setContent(htmlContent)

      // Process the content with custom CSS if available, otherwise use Tailwind CSS
      if (customCss) {
        const contentWithCustomCss = processContentWithCustomCss(htmlContent, customCss)
        setProcessedContent(contentWithCustomCss)
      } else {
        const tailwindContent = processTailwindContent(htmlContent)
        setProcessedContent(tailwindContent)
      }
    } catch (error) {
      console.error('Error processing content:', error)
      toast.error('Error processing content')
    } finally {
      setLoading(false)
    }
  }

  // Handle forcing iframe reload
  const handleReloadPage = () => {
    // Change the unique key to force a complete iframe reload
    setUniqueKey(Date.now())
    // Re-process the content
    loadAndProcessContent()
  }

  // Listen for messages from the iframe to adjust height
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'resize') {
        const newHeight = Math.max(event.data.height, 600)
        setIframeHeight(newHeight)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // Store current device in ref for screenshot capture
  useEffect(() => {
    originalDeviceRef.current = device
  }, [device])

  // Handle device change
  const handleDeviceChange = (newDevice: DeviceType) => {
    setDevice(newDevice)
  }

  // Get content for copying
  const getContentToCopy = async (): Promise<string> => {
    return content
  }

  // Get screenshot for publishing
  const getScreenshot = async (): Promise<string | null> => {
    try {
      setIsCapturing(true)

      // Store original device
      const currentDevice = originalDeviceRef.current

      // Force desktop view for screenshot if not already in desktop
      if (currentDevice !== 'desktop') {
        console.log('Switching to desktop view for screenshot')
        setDevice('desktop')

        // Wait for the device change to take effect
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // Ensure iframe is available
      if (!iframeRef.current) {
        console.error('No iframe found for screenshot')
        return null
      }

      // Check if we can access the iframe content
      try {
        // Try accessing the iframe content - this will throw if access is denied
        const iframeDoc = iframeRef.current.contentDocument
        const iframeWin = iframeRef.current.contentWindow

        if (!iframeDoc || !iframeWin) {
          throw new Error('Cannot access iframe content - document or window is null')
        }

        // Check if the document is fully loaded
        if (iframeDoc.readyState !== 'complete') {
          console.log('Waiting for iframe document to complete loading...')
          await new Promise<void>((resolve) => {
            const loadHandler = () => resolve()
            iframeRef.current?.addEventListener('load', loadHandler, { once: true })
            // Timeout after 3 seconds in case it never completes
            setTimeout(resolve, 3000)
          })
        }
      } catch (error) {
        console.error('Cannot access iframe content:', error)
        toast.error('Cannot access iframe content. Screenshot failed.')
        return null
      }

      // Wait for any pending height changes
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Capture the screenshot
      console.log('Attempting to capture iframe screenshot...')
      const screenshot = await captureIframeScreenshot('iframe')

      // Restore original device if changed
      if (currentDevice !== 'desktop') {
        setDevice(currentDevice)
      }

      if (screenshot) {
        toast.success('Screenshot captured successfully!')
      } else {
        toast.error('Failed to capture screenshot')
      }

      return screenshot
    } catch (error) {
      console.error('Failed to capture screenshot:', error)
      toast.error(
        'Screenshot capture failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      )
      return null
    } finally {
      setIsCapturing(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const currentDevice = deviceConfigs[device]
  const isDesktop = device === 'desktop'

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-900">
      {/* Header with actions */}
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white px-6 py-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <FileCode className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                HTML Preview
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                View generated component
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <DeviceSelector onDeviceChange={handleDeviceChange} initialDevice={device} />

            {/* CustomCssDialog with reload handler */}
            <CustomCssDialog onReloadPage={handleReloadPage} />

            <CopyButton getContentToCopy={getContentToCopy} />

            <PublishProjectDialog
              htmlContent={content}
              getScreenshot={getScreenshot}
              isCapturingScreenshot={isCapturing}
            />
          </div>
        </div>
      </header>

      {/* Content preview area */}
      <main className="flex-1 overflow-auto p-6">
        <div
          className="mx-auto"
          style={{
            width: currentDevice.width,
            maxWidth: isDesktop ? '100%' : currentDevice.width,
            transition: 'width 0.3s ease',
          }}
        >
          <div
            className={`relative overflow-hidden rounded-lg border border-neutral-200 bg-white p-0 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 ${
              !isDesktop ? 'mx-auto' : 'w-full max-w-full'
            }`}
          >
            {/* Preview Content */}
            <div
              className="bg-white dark:bg-neutral-950"
              style={{
                height: !isDesktop ? currentDevice.height : `${iframeHeight}px`,
                transition: 'height 0.3s ease',
                overflow: !isDesktop ? 'hidden' : 'visible',
              }}
            >
              <iframe
                key={uniqueKey} // This forces a re-render of the iframe when uniqueKey changes
                ref={iframeRef}
                srcDoc={processedContent}
                className="h-full w-full border-0"
                title="Tailwind Preview"
                sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups allow-popups-to-escape-sandbox"
                loading="lazy"
                onLoad={() => {
                  if (!iframeRef.current?.contentWindow) return

                  // Try to access the iframe's document to inject scripts if needed
                  try {
                    const iframeWindow = iframeRef.current.contentWindow as any
                    const iframeDoc = iframeRef.current.contentDocument

                    // Check if Tailwind loaded by looking for its object
                    setTimeout(() => {
                      if (iframeWindow && iframeDoc) {
                        // Check if Tailwind is already loaded
                        if (
                          !iframeWindow.tailwind &&
                          !iframeDoc.querySelector('script[src*="/assets/js/tailwind-fallback.js"]')
                        ) {
                          console.log('Tailwind not detected in iframe, injecting local version...')

                          // Create and inject the script
                          const script = iframeDoc.createElement('script')
                          script.src = env.NEXT_PUBLIC_TAILWIND_FALLBACK_PATH
                          iframeDoc.head.appendChild(script)
                        }
                      }
                    }, 500) // Give it some time to load
                  } catch (e) {
                    console.error('Could not access iframe content:', e)
                  }

                  // Try to force a resize after load
                  setTimeout(() => {
                    iframeRef.current?.contentWindow?.postMessage('checkSize', '*')
                  }, 200)
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
