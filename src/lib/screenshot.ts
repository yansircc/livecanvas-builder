'use client'

import * as htmlToImage from 'html-to-image'

/**
 * Captures a screenshot of an element and returns it as a base64 data URL
 * @param element The element to capture or a selector string
 * @returns A Promise that resolves to a base64 data URL of the screenshot
 */
export async function captureElementScreenshot(
  element: HTMLElement | string,
): Promise<string | null> {
  try {
    // Get the element if a selector was provided
    const targetElement = typeof element === 'string' ? document.querySelector(element) : element

    if (!targetElement) {
      console.error('Element not found:', element)
      return null
    }

    console.log('Capturing element screenshot with html-to-image')

    // Use html-to-image to capture the element
    const dataUrl = await htmlToImage.toJpeg(targetElement as HTMLElement, {
      quality: 0.95,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipAutoScale: true,
      pixelRatio: 2,
      // Skip web font processing to avoid CORS issues
      fontEmbedCSS: '',
      skipFonts: true,
      style: {
        transform: 'none',
        transformOrigin: 'center',
      },
      filter: (node) => {
        // Skip invisible elements
        if (node instanceof HTMLElement) {
          const style = window.getComputedStyle(node)
          return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
        }
        return true
      },
    })

    return dataUrl
  } catch (error) {
    console.error('Failed to capture element screenshot:', error)
    return null
  }
}

/**
 * Waits for an iframe to fully load
 * @param iframe The iframe element
 * @param timeout Maximum time to wait in milliseconds
 * @returns A Promise that resolves when the iframe is loaded
 */
export function waitForIframeLoad(iframe: HTMLIFrameElement, timeout = 5000): Promise<void> {
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
    return await captureIframeWithHtmlToImage(iframe)
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

    // Try a simpler approach as last resort
    try {
      console.log('Trying simplified capture approach')
      const iframeDocument = iframe.contentDocument
      if (!iframeDocument || !iframeDocument.body) return null

      return await htmlToImage.toJpeg(iframeDocument.body, {
        quality: 0.9,
        backgroundColor: '#ffffff',
        skipFonts: true,
        fontEmbedCSS: '',
        filter: (node) => node.nodeName !== 'SCRIPT',
      })
    } catch (lastError) {
      console.error('All capture methods failed:', lastError)
      return null
    }
  }
}
