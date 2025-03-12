'use client'

import * as htmlToImage from 'html-to-image'

/**
 * Waits for an iframe to fully load
 * @param iframe The iframe element
 * @param timeout Maximum time to wait in milliseconds
 * @returns A Promise that resolves when the iframe is loaded
 */
function waitForIframeLoad(iframe: HTMLIFrameElement, timeout = 5000): Promise<void> {
  return new Promise<void>((resolve) => {
    // If already loaded, resolve immediately
    if (iframe.contentDocument?.readyState === 'complete') {
      resolve()
      return
    }

    // Set up load event listener
    const handleLoad = () => resolve()
    iframe.addEventListener('load', handleLoad, { once: true })

    // Set up timeout
    const timeoutId = setTimeout(() => {
      iframe.removeEventListener('load', handleLoad)
      console.warn('Iframe load timeout reached')
      resolve()
    }, timeout)

    // Clean up timeout if load happens before timeout
    iframe.addEventListener('load', () => clearTimeout(timeoutId), { once: true })
  })
}

/**
 * Captures a screenshot of an iframe's content
 * @param iframeSelector The selector for the iframe
 * @returns A Promise that resolves to a base64 data URL of the screenshot
 */
export async function captureIframeScreenshot(iframeSelector: string): Promise<string | null> {
  try {
    const iframe = document.querySelector(iframeSelector) as HTMLIFrameElement
    if (!iframe) {
      console.error('Iframe not found:', iframeSelector)
      return null
    }

    // Wait for iframe to load
    await waitForIframeLoad(iframe)

    // Try different strategies to capture the iframe content
    try {
      // First try using html2canvas directly on the iframe
      return await captureIframeWithHtmlToImage(iframe)
    } catch (error) {
      console.error('Failed to capture with html-to-image, trying fallback method:', error)
      return await captureIframeWithFallbackMethod(iframe)
    }
  } catch (error) {
    console.error('Failed to capture iframe screenshot:', error)
    return null
  }
}

/**
 * Captures an iframe using html-to-image
 * @param iframe The iframe element
 * @returns A Promise that resolves to a base64 data URL of the screenshot
 */
async function captureIframeWithHtmlToImage(iframe: HTMLIFrameElement): Promise<string | null> {
  try {
    console.log('Capturing iframe with html-to-image')

    // Get the iframe document and body
    const iframeDocument = iframe.contentDocument
    const iframeBody = iframeDocument?.body

    if (!iframeDocument || !iframeBody) {
      console.error('Cannot access iframe document or body')
      return null
    }

    // Capture the iframe body with custom options
    const options = {
      quality: 0.95,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipAutoScale: true,
      pixelRatio: 2,
      includeQueryParams: true,
      // Skip web font processing to avoid CORS issues
      fontEmbedCSS: '',
      skipFonts: true,
      filter: (node: Node) => {
        // Skip invisible elements
        if (node instanceof HTMLElement) {
          const style = window.getComputedStyle(node)
          return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
        }
        return true
      },
    }

    // Add fetch options using type assertion
    const optionsWithFetch = {
      ...options,
      fetchOptions: {
        cache: 'force-cache',
        mode: 'cors',
        credentials: 'include',
      },
    }

    try {
      // First try with the bootstrap-preview div if it exists
      const previewDiv = iframeDocument.querySelector('.bootstrap-preview')
      if (previewDiv) {
        console.log('Capturing bootstrap-preview div')
        return await htmlToImage.toJpeg(previewDiv as HTMLElement, optionsWithFetch)
      }
    } catch (error) {
      console.warn('Failed to capture bootstrap-preview div:', error)
      // Continue to try with the body
    }

    // Fallback to capturing the entire body
    console.log('Capturing iframe body')
    const dataUrl = await htmlToImage.toJpeg(iframeBody, optionsWithFetch)

    return dataUrl
  } catch (error) {
    console.error('Failed to capture iframe with html-to-image:', error)
    throw error // Rethrow to try the fallback method
  }
}

/**
 * Fallback method to capture iframe using canvas
 * @param iframe The iframe element
 * @returns A Promise that resolves to a base64 data URL of the screenshot
 */
async function captureIframeWithFallbackMethod(iframe: HTMLIFrameElement): Promise<string | null> {
  try {
    console.log('Using fallback method to capture iframe')

    // Create a canvas element
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      console.error('Could not get canvas context')
      return null
    }

    // Set canvas dimensions to match iframe
    const width = iframe.clientWidth
    const height = iframe.clientHeight

    // Set the canvas size with device pixel ratio for better quality
    const scale = window.devicePixelRatio || 1
    canvas.width = width * scale
    canvas.height = height * scale
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'

    // Scale the context to match the device pixel ratio
    ctx.scale(scale, scale)

    // Set white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    // Try to draw the iframe content to the canvas
    try {
      // Create a temporary img element
      const img = new Image()
      img.crossOrigin = 'anonymous'

      // Use html2canvas on the iframe element itself
      const iframeDataUrl = await htmlToImage.toJpeg(iframe, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        skipFonts: true,
        fontEmbedCSS: '',
        pixelRatio: scale,
      })

      if (!iframeDataUrl) {
        throw new Error('Failed to create data URL from iframe')
      }

      // Return the data URL directly
      return iframeDataUrl
    } catch (error) {
      console.error('Failed to draw iframe to canvas:', error)

      // Last resort: just take a screenshot of the iframe element itself
      try {
        return await htmlToImage.toJpeg(iframe, {
          quality: 0.9,
          backgroundColor: '#ffffff',
          skipFonts: true,
          fontEmbedCSS: '',
        })
      } catch (finalError) {
        console.error('Final fallback method failed:', finalError)
        return null
      }
    }
  } catch (error) {
    console.error('Fallback capture method failed:', error)
    return null
  }
}
