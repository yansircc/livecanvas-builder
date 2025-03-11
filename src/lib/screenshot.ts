'use client'

import html2canvas from 'html2canvas'

/**
 * Captures a screenshot of an HTML element
 * @param selector CSS selector for the element to capture
 * @returns Promise that resolves to a base64 image string or null if capture fails
 */
export async function captureElementScreenshot(selector: string): Promise<string | null> {
  try {
    // Find the element to capture
    const element = document.querySelector(selector)
    if (!element) {
      console.error(`Element not found: ${selector}`)
      return null
    }

    // Use html2canvas to capture the element
    const canvas = await html2canvas(element as HTMLElement, {
      useCORS: true,
      scale: 1,
      logging: false,
      allowTaint: true,
    })

    // Convert to base64 image
    return canvas.toDataURL('image/jpeg', 0.85)
  } catch (error) {
    console.error('Screenshot capture failed:', error)
    return null
  }
}

/**
 * Captures a screenshot of an iframe
 * @param iframeSelector CSS selector for the iframe
 * @returns Promise that resolves to a base64 image string or null if capture fails
 */
export async function captureIframeScreenshot(iframeSelector: string): Promise<string | null> {
  try {
    // Find the iframe
    const iframe = document.querySelector(iframeSelector) as HTMLIFrameElement
    if (!iframe) {
      console.error(`Iframe not found: ${iframeSelector}`)
      return null
    }

    // Wait for iframe to load if needed
    if (iframe.contentDocument?.readyState !== 'complete') {
      await new Promise((resolve) => {
        iframe.onload = resolve
      })
    }

    // Get iframe document
    const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDocument) {
      console.error('Cannot access iframe content')
      return null
    }

    // Use html2canvas to capture the iframe content
    const canvas = await html2canvas(iframeDocument.body, {
      useCORS: true,
      scale: 1,
      logging: false,
      allowTaint: true,
      width: iframe.clientWidth,
      height: iframe.clientHeight,
    })

    // Convert to base64 image
    return canvas.toDataURL('image/jpeg', 0.85)
  } catch (error) {
    console.error('Iframe screenshot capture failed:', error)
    return null
  }
}

/**
 * Test function to capture a screenshot and display it
 * @param selector CSS selector for the element or iframe to capture
 * @param isIframe Whether the selector points to an iframe
 */
export async function testScreenshotCapture(
  selector: string,
  isIframe = false,
): Promise<string | null> {
  try {
    const screenshot = isIframe
      ? await captureIframeScreenshot(selector)
      : await captureElementScreenshot(selector)

    if (screenshot) {
      console.log('Screenshot captured successfully')

      // For debugging: create a temporary image element to view the screenshot
      const img = document.createElement('img')
      img.src = screenshot
      img.style.position = 'fixed'
      img.style.top = '10px'
      img.style.right = '10px'
      img.style.maxWidth = '300px'
      img.style.maxHeight = '300px'
      img.style.border = '2px solid #333'
      img.style.borderRadius = '4px'
      img.style.zIndex = '9999'
      img.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)'

      // Add close button
      const closeBtn = document.createElement('button')
      closeBtn.textContent = '×'
      closeBtn.style.position = 'absolute'
      closeBtn.style.top = '0'
      closeBtn.style.right = '0'
      closeBtn.style.background = '#ff4444'
      closeBtn.style.color = 'white'
      closeBtn.style.border = 'none'
      closeBtn.style.borderRadius = '50%'
      closeBtn.style.width = '20px'
      closeBtn.style.height = '20px'
      closeBtn.style.cursor = 'pointer'
      closeBtn.style.display = 'flex'
      closeBtn.style.alignItems = 'center'
      closeBtn.style.justifyContent = 'center'
      closeBtn.onclick = () => {
        document.body.removeChild(container)
      }

      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.top = '10px'
      container.style.right = '10px'
      container.style.zIndex = '9999'
      container.appendChild(img)
      container.appendChild(closeBtn)

      document.body.appendChild(container)

      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (document.body.contains(container)) {
          document.body.removeChild(container)
        }
      }, 10000)
    }

    return screenshot
  } catch (error) {
    console.error('Test screenshot capture failed:', error)
    return null
  }
}
