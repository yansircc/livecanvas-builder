/**
 * CSS Processor for HTML content
 * Handles Tailwind CSS, AOS animations, and custom CSS injection
 */

// Types
interface ResourceOptions {
  includeTailwind?: boolean
  includeAOS?: boolean
  includeGoogleFonts?: boolean
}

// Main processors
export function processTailwindContent(content: string): string {
  const hasTailwind = content.includes('tailwindcss') || content.includes('@tailwindcss/browser')
  const hasHeadTag = content.includes('<head>') && content.includes('</head>')
  const hasAOS = content.includes('aos@2.3.1') || content.includes('aos.js')
  const hasHtmlStructure = content.includes('<html') && content.includes('<body')

  // Handle different content types
  if (!hasHtmlStructure) {
    return wrapFragment(content)
  }

  if (!hasHeadTag) {
    return injectHead(content, { includeTailwind: !hasTailwind, includeAOS: !hasAOS })
  }

  // Inject missing resources if needed
  let processedContent = content

  if (hasHeadTag && !hasTailwind) {
    processedContent = injectIntoHead(processedContent, getTailwindResources())
  }

  if (hasHeadTag && !hasAOS) {
    processedContent = injectIntoHead(processedContent, getAOSStylesheet())
    processedContent = injectIntoBody(processedContent, getAOSScripts())
  }

  return addResizeScript(processedContent)
}

export function processContentWithCustomCss(
  content: string,
  customCss: string | null | undefined,
): string {
  if (!customCss) {
    return processTailwindContent(content)
  }

  const hasHtmlTag = content.includes('<html')
  const hasBodyTag = content.includes('<body')
  const hasHeadTag = content.includes('<head>') && content.includes('</head>')
  const hasAOS = content.includes('aos@2.3.1') || content.includes('aos.js')

  // Process CSS
  const { processedCss, googleFontsLink } = processCustomCss(customCss)

  // Fragment - wrap in complete HTML
  if (!hasHtmlTag && !hasBodyTag) {
    return createCompleteHtml(content, processedCss, googleFontsLink)
  }

  // Has HTML/body but no head
  if (hasHtmlTag && hasBodyTag && !hasHeadTag) {
    return injectHead(
      content,
      {
        includeTailwind: true,
        includeAOS: !hasAOS,
      },
      processedCss,
      googleFontsLink,
    )
  }

  // Has head - inject resources
  if (hasHeadTag) {
    let processedContent = content

    if (googleFontsLink && !processedContent.includes('fonts.googleapis.com')) {
      processedContent = injectIntoHead(processedContent, googleFontsLink)
    }

    if (!processedContent.includes('@tailwindcss/browser')) {
      processedContent = injectIntoHead(processedContent, getTailwindResources())
    }

    if (processedCss) {
      processedContent = injectIntoHead(processedContent, getCustomCssStyle(processedCss))
    }

    if (!hasAOS) {
      processedContent = injectIntoHead(processedContent, getAOSStylesheet())
      processedContent = injectIntoBody(processedContent, getAOSScripts())
    }

    return addResizeScript(processedContent)
  }

  // Fallback - wrap content
  return createCompleteHtml(content, processedCss, googleFontsLink)
}

// HTML Structure Helpers
function wrapFragment(fragment: string): string {
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tailwind Preview</title>
    ${getTailwindResources()}
    ${getTailwindMinimalStyles()}
    ${getAOSStylesheet()}
  </head>
  <body>
    <div class="tailwind-content">
      ${fragment}
    </div>
    ${getAOSScripts()}
  </body>
</html>`

  return addResizeScript(html)
}

function injectHead(
  html: string,
  options: ResourceOptions,
  customCss?: string,
  googleFontsLink?: string,
): string {
  const { includeTailwind = true, includeAOS = true } = options

  let headContent =
    '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">'

  if (googleFontsLink) {
    headContent += googleFontsLink
  }

  if (includeTailwind) {
    headContent += getTailwindResources()
    headContent += getTailwindMinimalStyles()
  }

  if (customCss) {
    headContent += getCustomCssStyle(customCss)
  }

  if (includeAOS) {
    headContent += getAOSStylesheet()
  }

  headContent += '</head>'

  let processedHtml = html.replace('<body', `${headContent}<body`)

  if (includeAOS) {
    processedHtml = injectIntoBody(processedHtml, getAOSScripts())
  }

  return addResizeScript(processedHtml)
}

function createCompleteHtml(content: string, customCss?: string, googleFontsLink?: string): string {
  return addResizeScript(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview with Custom CSS</title>
    ${googleFontsLink || ''}
    ${getTailwindResources()}
    ${getTailwindMinimalStyles()}
    ${customCss ? getCustomCssStyle(customCss) : ''}
    ${getAOSStylesheet()}
  </head>
  <body>
    ${content}
    ${getAOSScripts()}
  </body>
</html>`)
}

// String Manipulation Helpers
function injectIntoHead(html: string, content: string): string {
  return html.replace('</head>', `${content}</head>`)
}

function injectIntoBody(html: string, content: string): string {
  return html.replace('</body>', `${content}</body>`)
}

// Resource Generators
function getTailwindResources(): string {
  return `
<script src="${process.env.NEXT_PUBLIC_TAILWIND_CDN_URL}" crossorigin="anonymous" onerror="loadFallbackTailwind()"></script>
<script>
  function loadFallbackTailwind() {
    console.log('CDN Tailwind failed, loading local fallback...');
    const script = document.createElement('script');
    script.src = window.location.origin + '${process.env.NEXT_PUBLIC_TAILWIND_FALLBACK_PATH}';
    document.head.appendChild(script);
  }
</script>`
}

function getTailwindMinimalStyles(): string {
  return `
<style>
  /* Minimal Tailwind reset and utilities */
  *, ::before, ::after { box-sizing: border-box; border-width: 0; border-style: solid; }
  html { line-height: 1.5; -webkit-text-size-adjust: 100%; tab-size: 4; font-family: ui-sans-serif, system-ui, sans-serif; }
  body { margin: 0; line-height: inherit; }
  /* Basic utility classes */
  .flex { display: flex; }
  .items-center { align-items: center; }
  .justify-center { justify-content: center; }
  .mx-auto { margin-left: auto; margin-right: auto; }
  .p-4 { padding: 1rem; }
  .rounded { border-radius: 0.25rem; }
  .bg-white { background-color: #fff; }
  .text-center { text-align: center; }
</style>`
}

function getAOSStylesheet(): string {
  return '<link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" crossorigin="anonymous">'
}

function getAOSScripts(): string {
  return `
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
</script>`
}

function getCustomCssStyle(css: string): string {
  return `
<style type="text/tailwindcss">
  ${css}
</style>`
}

// CSS Processing
function processCustomCss(css: string): { processedCss: string; googleFontsLink: string } {
  // Handle tailwind imports
  let processedCss = css
  const importsTailwind = css.includes('@import') && css.includes('tailwindcss')

  if (importsTailwind) {
    processedCss = processedCss.replace(/@import\s+(['"])tailwindcss\1;?/g, '')
  }

  // Extract Google Fonts
  const fontFamilies = new Set<string>()
  const fontFaceRegex = /@font-face\s*{\s*font-family:\s*["']([^"']+)["'];/g
  let fontMatch

  while ((fontMatch = fontFaceRegex.exec(processedCss)) !== null) {
    if (fontMatch[1]) {
      fontFamilies.add(fontMatch[1])
    }
  }

  // Fix incorrect Google Fonts usage
  processedCss = processedCss.replace(
    /@font-face\s*{\s*font-family:\s*["']([^"']+)["'];\s*src:\s*url\(["']https:\/\/fonts\.googleapis\.com\/css2\?family=([^&"']+).*?["']\);\s*}/g,
    (match) => {
      return `/* ${match} */\n/* Replaced with proper Google Fonts import */`
    },
  )

  // Create Google Fonts link
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

  return { processedCss, googleFontsLink }
}

/**
 * Add a script to dynamically resize the iframe based on content height
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
  return injectIntoBody(html, resizeScript)
}
