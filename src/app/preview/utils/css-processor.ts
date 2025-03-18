/**
 * Process HTML content to ensure it has Tailwind CSS properly incorporated
 * @param content The HTML content to process
 * @returns The processed HTML with Tailwind CSS
 */
export function processTailwindContent(content: string): string {
  // Check if content already has Tailwind or includes a head tag
  const hasTailwind = content.includes('tailwind') || content.includes('cdn.tailwindcss.com')
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
        '<script src="https://cdn.tailwindcss.com"></script></head>',
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
    <script src="https://cdn.tailwindcss.com"></script>
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
    head += '<script src="https://cdn.tailwindcss.com"></script>'
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
