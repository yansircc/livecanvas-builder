'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
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
    <div key={urlKey} className="bg-background flex h-screen flex-col">
      {/* Header with title, device selector, and copy button */}
      <div className="flex items-center justify-between border-b bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="font-playfair bg-clip-text text-2xl font-bold tracking-tight">
            HTML 预览
          </h1>
          <div className="ml-4">
            <DeviceSelector onDeviceChange={handleDeviceChange} initialDevice={device} />
          </div>
        </div>
        <CopyButton getContentToCopy={getContentToCopy} />
      </div>

      {/* Preview frame */}
      <PreviewFrame content={iframeContent} deviceConfig={currentDevice} />

      {/* Hash navigation handler */}
      <HashNavigationHandler />
    </div>
  )
}
