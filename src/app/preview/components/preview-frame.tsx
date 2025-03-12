'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { DeviceFrame } from './device-frame'
import type { DeviceConfig, DeviceType } from './device-selector'

interface PreviewFrameProps {
  content: string
  deviceConfig: DeviceConfig
  deviceType: DeviceType
}

export function PreviewFrame({ content, deviceType }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeHeight, setIframeHeight] = useState<number>(800) // Default height
  const containerRef = useRef<HTMLDivElement>(null)

  // Monitor iframe content loading to adjust height
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const handleIframeLoad = () => {
      try {
        // Wait a bit to ensure content is fully rendered
        setTimeout(() => {
          if (iframe.contentDocument && iframe.contentWindow) {
            // Get the actual height of the content
            const docHeight = Math.max(
              iframe.contentDocument.body.scrollHeight,
              iframe.contentDocument.documentElement.scrollHeight,
              iframe.contentDocument.body.offsetHeight,
              iframe.contentDocument.documentElement.offsetHeight,
              iframe.contentDocument.body.clientHeight,
              iframe.contentDocument.documentElement.clientHeight,
              800, // Minimum height
            )

            setIframeHeight(docHeight)

            // Monitor content changes
            const resizeObserver = new ResizeObserver(() => {
              if (iframe.contentDocument) {
                const newHeight = Math.max(
                  iframe.contentDocument.body.scrollHeight,
                  iframe.contentDocument.documentElement.scrollHeight,
                  iframe.contentDocument.body.offsetHeight,
                  iframe.contentDocument.documentElement.offsetHeight,
                  iframe.contentDocument.body.clientHeight,
                  iframe.contentDocument.documentElement.clientHeight,
                  800, // Minimum height
                )
                setIframeHeight(newHeight)
              }
            })

            resizeObserver.observe(iframe.contentDocument.body)

            return () => {
              resizeObserver.disconnect()
            }
          }
        }, 300) // Increased timeout to ensure content is fully loaded
      } catch (error) {
        console.error('Error resizing iframe:', error)
      }
    }

    iframe.addEventListener('load', handleIframeLoad)
    return () => {
      iframe.removeEventListener('load', handleIframeLoad)
    }
  }, [content])

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'resize') {
        const newHeight = Math.max(event.data.height, 800) // Ensure minimum height
        setIframeHeight(newHeight)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // Determine whether to use auto height based on device type
  const isDesktop = deviceType === 'desktop'

  // Set dimensions based on device type
  const getFrameDimensions = () => {
    switch (deviceType) {
      case 'mobile':
        return {
          width: '375px',
          height: '667px',
          contentHeight: '580px', // Account for status bar and home indicator
        }
      case 'tablet':
        return {
          width: '768px',
          height: '1024px',
          contentHeight: '950px', // Account for status bar and home button
        }
      case 'desktop':
      default:
        return {
          width: '100%',
          height: 'auto',
          contentHeight: `${iframeHeight}px`,
        }
    }
  }

  const dimensions = getFrameDimensions()

  // Render the iframe inside the appropriate device frame
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div
        ref={containerRef}
        className={cn('transition-all duration-300', isDesktop ? 'w-full max-w-full' : 'mx-auto')}
        style={{
          width: dimensions.width,
          maxWidth: isDesktop ? '100%' : dimensions.width,
        }}
      >
        <DeviceFrame deviceType={deviceType} className="transition-all duration-300">
          <div
            className="w-full bg-white"
            style={{
              height: !isDesktop ? dimensions.contentHeight : 'auto',
              minHeight: isDesktop ? `${iframeHeight}px` : 'auto',
              overflow: 'auto',
            }}
          >
            <iframe
              ref={iframeRef}
              srcDoc={content}
              className="h-full w-full border-0 bg-white"
              title="HTML 预览"
              scrolling="auto"
              style={{
                overflow: 'auto',
                height: '100%',
                minHeight: isDesktop ? `${iframeHeight}px` : 'auto',
              }}
            />
          </div>
        </DeviceFrame>
      </div>
    </div>
  )
}

// Helper function to get content from the iframe
export function getIframeContent(iframe: HTMLIFrameElement | null): string {
  if (!iframe?.contentDocument) {
    return ''
  }

  // Try to get content from the bootstrap-preview div
  const previewContent = iframe.contentDocument.querySelector('.bootstrap-preview')
  if (previewContent) {
    return previewContent.innerHTML
  }

  // Fallback to the entire body content
  return iframe.contentDocument.body.innerHTML || ''
}
