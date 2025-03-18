/**
 * Process HTML content to ensure it has Tailwind CSS properly incorporated
 * @param content The HTML content to process
 * @returns The processed HTML with Tailwind CSS
 */
export function processTailwindContent(content: string): string {
  // Check if content already has Tailwind or includes a head tag
  const hasTailwind = content.includes('tailwindcss') || content.includes('@tailwindcss/browser')
  const hasHeadTag = content.includes('<head>') && content.includes('</head>')
  const hasAOS = content.includes('aos@2.3.1') || content.includes('aos.js')

  // If the content is just a fragment (no html/body tags), wrap it
  if (!content.includes('<html') && !content.includes('<body')) {
    return wrapContentWithTailwind(content)
  }

  // If it has html/body but no head, add a head with Tailwind
  if (!hasHeadTag) {
    return injectHeadIntoHtml(content, !hasTailwind, !hasAOS)
  }

  // If it has a head tag but is missing Tailwind or AOS
  if (hasHeadTag && (!hasTailwind || !hasAOS)) {
    let processedContent = content

    // Add Tailwind if missing
    if (!hasTailwind) {
      processedContent = processedContent.replace(
        '</head>',
        '<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script></head>',
      )
    }

    // Add AOS if missing
    if (!hasAOS) {
      processedContent = processedContent.replace(
        '</head>',
        '<link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" crossorigin="anonymous">\n</head>',
      )
      processedContent = processedContent.replace(
        '</body>',
        '<script src="https://unpkg.com/aos@2.3.1/dist/aos.js" crossorigin="anonymous"></script>\n<script>document.addEventListener("DOMContentLoaded", function() { AOS.init(); });</script>\n</body>',
      )
    }

    return addResizeScript(processedContent)
  }

  // Return as is if it already has everything, but add resize script
  return addResizeScript(content)
}

/**
 * Wrap a HTML fragment with proper HTML structure and Tailwind CSS
 * @param fragment The HTML fragment to wrap
 * @returns The wrapped HTML with Tailwind CSS
 */
function wrapContentWithTailwind(fragment: string): string {
  return addResizeScript(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tailwind Preview</title>
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" crossorigin="anonymous">
  </head>
  <body>
    <div class="tailwind-content">
      ${fragment}
    </div>
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js" crossorigin="anonymous"></script>
    <script>
      document.addEventListener("DOMContentLoaded", function() {
        if (typeof AOS !== 'undefined') {
          AOS.init({
            duration: 800,
            once: false,
            mirror: true,
          });
        }
      });
    </script>
  </body>
</html>`)
}

/**
 * Inject head with Tailwind CSS and/or AOS into existing HTML
 * @param html The HTML to inject into
 * @param includeTailwind Whether to include Tailwind
 * @param includeAOS Whether to include AOS
 * @returns The HTML with head injected
 */
function injectHeadIntoHtml(html: string, includeTailwind = true, includeAOS = true): string {
  let head =
    '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">'

  if (includeTailwind) {
    head += '<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>'
  }

  if (includeAOS) {
    head +=
      '<link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" crossorigin="anonymous">'
  }

  head += '</head>'

  let processedHtml = html

  if (html.includes('<html') && html.includes('<body')) {
    processedHtml = html.replace('<body', `${head}<body`)
  } else {
    processedHtml = `<!DOCTYPE html><html lang="en">${head}<body>${html}</body></html>`
  }

  // Add AOS initialization
  if (includeAOS) {
    processedHtml = processedHtml.replace(
      '</body>',
      `
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js" crossorigin="anonymous"></script>
    <script>
      document.addEventListener("DOMContentLoaded", function() {
        if (typeof AOS !== 'undefined') {
          AOS.init({
            duration: 800,
            once: false,
            mirror: true,
          });
        }
      });
    </script>
    </body>`,
    )
  }

  return addResizeScript(processedHtml)
}

/**
 * Add a script to dynamically resize the iframe based on content height
 * @param html The HTML to add the resize script to
 * @returns The HTML with resize script added
 */
function addResizeScript(html: string): string {
  const resizeScript = `
<script>
  // Function to notify parent about content height
  function updateParentHeight() {
    // Calculate the scrollHeight of document
    const height = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
      document.documentElement.clientHeight
    );
    
    // Send message to parent window
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'resize', height: height }, '*');
    }
  }
  
  // Update height on load
  window.addEventListener('load', function() {
    // Allow small delay for rendering
    setTimeout(updateParentHeight, 100);
    
    // Monitor for image loads
    document.querySelectorAll('img').forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', updateParentHeight);
        img.addEventListener('error', updateParentHeight);
      }
    });
    
    // Create a ResizeObserver to watch for DOM changes
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(updateParentHeight);
      resizeObserver.observe(document.body);
    }
  });
  
  // Also update on window resize and orientation change
  window.addEventListener('resize', updateParentHeight);
  window.addEventListener('orientationchange', updateParentHeight);
</script>
`

  // Add the resize script before the closing body tag
  return html.replace('</body>', `${resizeScript}</body>`)
}

/**
 * Process HTML content with custom CSS
 * @param content Original HTML content
 * @param customCss Custom CSS to inject
 * @returns HTML content with custom CSS injected
 */
export function processContentWithCustomCss(
  content: string,
  customCss: string | null | undefined,
): string {
  // Check if content already includes certain elements
  const hasHtmlTag = content.includes('<html')
  const hasBodyTag = content.includes('<body')
  const hasHeadTag = content.includes('<head>') && content.includes('</head>')
  const hasAOS = content.includes('aos@2.3.1') || content.includes('aos.js')

  // Check if custom CSS imports tailwindcss (handle with or without semicolon)
  const importsTailwind =
    (customCss?.includes('@import') && customCss?.includes('tailwindcss')) || false

  // Prepare custom CSS by removing problematic imports for TailwindCSS v4
  let processedCss = customCss
  if (importsTailwind && processedCss) {
    // Remove the tailwind import as we'll include the CDN
    processedCss = processedCss.replace(/@import\s+(['"])tailwindcss\1;?/g, '')
  }

  // Fix Google Fonts imports in @font-face declarations
  if (processedCss) {
    // Extract font names from @font-face declarations that use Google Fonts
    const fontFamilies = new Set<string>()
    const fontFaceRegex = /@font-face\s*{\s*font-family:\s*["']([^"']+)["'];/g
    let fontMatch

    while ((fontMatch = fontFaceRegex.exec(processedCss)) !== null) {
      if (fontMatch[1]) {
        fontFamilies.add(fontMatch[1])
      }
    }

    // Convert incorrect @font-face declarations with Google Fonts URLs to comments
    processedCss = processedCss.replace(
      /@font-face\s*{\s*font-family:\s*["']([^"']+)["'];\s*src:\s*url\(["']https:\/\/fonts\.googleapis\.com\/css2\?family=([^&"']+).*?["']\);\s*}/g,
      (match) => {
        return `/* ${match} */\n/* Replaced with proper Google Fonts import */`
      },
    )

    // Generate Google Fonts link if needed
    const googleFontsLink =
      fontFamilies.size > 0
        ? `
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${Array.from(fontFamilies)
            .map((f) => f.replace(/\s+/g, '+'))
            .join('&family=')}&display=swap" rel="stylesheet">
`
        : ''

    // If the content is just a fragment (no html/body tags), wrap it with custom CSS
    if (!hasHtmlTag && !hasBodyTag) {
      return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview with Custom CSS</title>
    ${googleFontsLink}
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <style type="text/tailwindcss">
      ${processedCss}
    </style>
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" crossorigin="anonymous">
  </head>
  <body>
    <div class="tailwind-content">
      ${content}
    </div>
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js" crossorigin="anonymous"></script>
    <script>
      document.addEventListener("DOMContentLoaded", function() {
        if (typeof AOS !== 'undefined') {
          AOS.init({
            duration: 800,
            once: false,
            mirror: true,
          });
        }
      });
    </script>
  </body>
</html>`
    }

    // If it has html/body but no head, inject a head with custom CSS
    if (hasHtmlTag && hasBodyTag && !hasHeadTag) {
      let head =
        '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">'

      // Add Google Fonts if needed
      if (googleFontsLink) {
        head += googleFontsLink
      }

      // Add Tailwind
      head += '<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>'

      // Add custom CSS with type="text/tailwindcss"
      if (processedCss) {
        head += `<style type="text/tailwindcss">
  ${processedCss}
</style>`
      }

      // Add AOS CSS
      head +=
        '<link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" crossorigin="anonymous">'
      head += '</head>'

      let processedHtml = content.replace('<body', `${head}<body`)

      // Add AOS initialization if needed
      if (!hasAOS) {
        processedHtml = processedHtml.replace(
          '</body>',
          `
          <script src="https://unpkg.com/aos@2.3.1/dist/aos.js" crossorigin="anonymous"></script>
          <script>
            document.addEventListener("DOMContentLoaded", function() {
              if (typeof AOS !== 'undefined') {
                AOS.init({
                  duration: 800,
                  once: false,
                  mirror: true,
                });
              }
            });
          </script>
          </body>`,
        )
      }

      return addResizeScript(processedHtml)
    }

    // If it has a head tag, inject the custom CSS into it
    if (hasHeadTag) {
      let processedContent = content

      // Add Google Fonts if needed
      if (googleFontsLink && !processedContent.includes('fonts.googleapis.com')) {
        processedContent = processedContent.replace('</head>', `${googleFontsLink}</head>`)
      }

      // Add Tailwind if missing
      if (!processedContent.includes('@tailwindcss/browser')) {
        processedContent = processedContent.replace(
          '</head>',
          '<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script></head>',
        )
      }

      // Add custom CSS with type="text/tailwindcss"
      if (processedCss) {
        processedContent = processedContent.replace(
          '</head>',
          `<style type="text/tailwindcss">
  ${processedCss}
</style></head>`,
        )
      }

      // Add AOS if missing
      if (!hasAOS) {
        processedContent = processedContent.replace(
          '</head>',
          '<link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" crossorigin="anonymous">\n</head>',
        )
        processedContent = processedContent.replace(
          '</body>',
          '<script src="https://unpkg.com/aos@2.3.1/dist/aos.js" crossorigin="anonymous"></script>\n<script>document.addEventListener("DOMContentLoaded", function() { AOS.init(); });</script>\n</body>',
        )
      }

      return addResizeScript(processedContent)
    }

    // Fallback - wrap the content in a complete HTML structure
    return addResizeScript(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview with Custom CSS</title>
    ${googleFontsLink}
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <style type="text/tailwindcss">
      ${processedCss}
    </style>
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" crossorigin="anonymous">
  </head>
  <body>
    ${content}
    <script src="https://unpkg.com/aos@2.3.1/dist/aos.js" crossorigin="anonymous"></script>
    <script>
      document.addEventListener("DOMContentLoaded", function() {
        if (typeof AOS !== 'undefined') {
          AOS.init({
            duration: 800,
            once: false,
            mirror: true,
          });
        }
      });
    </script>
  </body>
</html>`)
  }

  // If no custom CSS, just use the regular Tailwind processor
  return processTailwindContent(content)
}
