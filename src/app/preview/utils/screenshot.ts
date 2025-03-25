"use client";

import * as htmlToImage from "html-to-image";

/**
 * Waits for an iframe to fully load
 * @param iframe The iframe element
 * @param timeout Maximum time to wait in milliseconds
 * @returns A Promise that resolves when the iframe is loaded
 */
function waitForIframeLoad(
  iframe: HTMLIFrameElement,
  timeout = 5000
): Promise<void> {
  return new Promise<void>((resolve) => {
    // If already loaded, resolve immediately
    if (iframe.contentDocument?.readyState === "complete") {
      resolve();
      return;
    }

    // Set up load event listener
    const handleLoad = () => resolve();
    iframe.addEventListener("load", handleLoad, { once: true });

    // Set up timeout
    const timeoutId = setTimeout(() => {
      iframe.removeEventListener("load", handleLoad);
      console.warn("Iframe 加载超时");
      resolve();
    }, timeout);

    // Clean up timeout if load happens before timeout
    iframe.addEventListener("load", () => clearTimeout(timeoutId), {
      once: true,
    });
  });
}

/**
 * Captures a screenshot of an iframe's content
 * @param iframeSelector The selector for the iframe
 * @returns A Promise that resolves to a base64 data URL of the screenshot
 */
export async function captureIframeScreenshot(
  iframeSelector: string
): Promise<string | null> {
  try {
    const iframe = document.querySelector(iframeSelector) as HTMLIFrameElement;
    if (!iframe) {
      console.error("Iframe 未找到:", iframeSelector);
      return null;
    }

    // Wait for iframe to load
    await waitForIframeLoad(iframe);
    return await captureIframeWithHtmlToImage(iframe);
  } catch (error) {
    console.error("Failed to capture iframe screenshot:", error);
    return null;
  }
}

/**
 * Captures an iframe using html-to-image
 * @param iframe The iframe element
 * @returns A Promise that resolves to a base64 data URL of the screenshot
 */
async function captureIframeWithHtmlToImage(
  iframe: HTMLIFrameElement
): Promise<string | null> {
  try {
    console.log("Capturing iframe with html-to-image");

    // Get the iframe document and body
    const iframeDocument = iframe.contentDocument;
    const iframeBody = iframeDocument?.body;

    if (!iframeDocument || !iframeBody) {
      console.error("Cannot access iframe document or body");
      return null;
    }

    // Capture the iframe body with custom options
    const options = {
      quality: 0.95,
      backgroundColor: "#ffffff",
      cacheBust: true,
      skipAutoScale: true,
      pixelRatio: 2,
      includeQueryParams: true,
      // Skip web font processing to avoid CORS issues
      fontEmbedCSS: "",
      skipFonts: true,
      filter: (node: Node) => {
        // Skip invisible elements
        if (node instanceof HTMLElement) {
          const style = window.getComputedStyle(node);
          return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0"
          );
        }
        return true;
      },
    };

    // Add fetch options using type assertion
    const optionsWithFetch = {
      ...options,
      fetchOptions: {
        cache: "force-cache",
        mode: "cors",
        credentials: "include",
      },
    };

    // First try with specific content containers if they exist
    try {
      // Check for tailwind-content div (our new implementation)
      const tailwindContentDiv =
        iframeDocument.querySelector(".tailwind-content");
      if (tailwindContentDiv) {
        console.log("Capturing tailwind-content div");
        return await htmlToImage.toJpeg(
          tailwindContentDiv as HTMLElement,
          optionsWithFetch
        );
      }

      // Check for bootstrap-preview div (original implementation)
      const bootstrapPreviewDiv =
        iframeDocument.querySelector(".bootstrap-preview");
      if (bootstrapPreviewDiv) {
        console.log("Capturing bootstrap-preview div");
        return await htmlToImage.toJpeg(
          bootstrapPreviewDiv as HTMLElement,
          optionsWithFetch
        );
      }
    } catch (error) {
      console.warn("Failed to capture specific content container:", error);
      // Continue to try with the body
    }

    // Fallback to capturing the entire body
    console.log("Capturing iframe body");
    const dataUrl = await htmlToImage.toJpeg(iframeBody, optionsWithFetch);

    return dataUrl;
  } catch (error) {
    console.error("Failed to capture iframe with html-to-image:", error);
    throw error; // Rethrow to try the fallback method
  }
}
