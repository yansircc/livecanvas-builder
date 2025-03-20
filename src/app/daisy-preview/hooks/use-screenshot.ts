import { toast } from 'sonner'
import { useState, type RefObject } from 'react'
import { captureIframeScreenshot } from '../utils/screenshot'
import { type DeviceType } from './use-preview'

interface UseScreenshotProps {
  iframeRef: RefObject<HTMLIFrameElement>
  device: DeviceType
  setDevice: (device: DeviceType) => void
}

export function useScreenshot({ iframeRef, device, setDevice }: UseScreenshotProps) {
  const [isCapturing, setIsCapturing] = useState(false)

  const getScreenshot = async (): Promise<string | null> => {
    try {
      setIsCapturing(true)

      // Store original device
      const currentDevice = device

      // Force desktop view for screenshot if not already in desktop
      if (currentDevice !== 'desktop') {
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

  return {
    getScreenshot,
    isCapturing,
  }
}
