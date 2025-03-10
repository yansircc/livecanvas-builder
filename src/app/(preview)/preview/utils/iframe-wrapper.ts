export function IframeWrapper(content: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HTML 预览</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet">
        <style>
          html, body {
            margin: 0;
            padding: 0;
            overflow: auto;
            height: auto;
            min-height: 100%;
            width: 100%;
          }
          body {
            display: flex;
            flex-direction: column;
            position: relative;
            min-height: 100vh;
          }
          .bootstrap-preview {
            width: 100%;
            height: auto;
            min-height: 100%;
            padding: 0;
            margin: 0;
            overflow: visible;
            display: block;
          }
          
          /* Ensure all content is visible and scrollable */
          img, video, iframe {
            max-width: 100%;
            height: auto;
          }
          
          /* Fix for fixed position elements in mobile view */
          .fixed-element {
            position: absolute;
          }
          
          /* Ensure proper touch scrolling on mobile */
          @media (max-width: 768px) {
            html, body {
              -webkit-overflow-scrolling: touch;
            }
          }
        </style>
      </head>
      <body>
        <div class="bootstrap-preview">
          ${content}
        </div>
        <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            AOS.init({
              duration: 800,
              once: false,
              mirror: true,
            });
            
            // Handle internal links to prevent parent page navigation
            document.addEventListener('click', function(e) {
              const target = e.target.closest('a');
              if (target && target.getAttribute('href')?.startsWith('#')) {
                e.preventDefault();
                const hash = target.getAttribute('href');
                window.location.hash = hash;
              }
            });
            
            // Notify parent window to adjust iframe height
            function updateParentHeight() {
              const height = Math.max(
                document.body.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight,
                document.documentElement.clientHeight,
                800 // Minimum height
              );
              
              window.parent.postMessage({
                type: 'resize',
                height: height
              }, '*');
            }
            
            // Initial height update
            updateParentHeight();
            
            // Monitor content changes to update height
            const resizeObserver = new ResizeObserver(() => {
              updateParentHeight();
            });
            
            resizeObserver.observe(document.body);
            
            // Also update on window resize
            window.addEventListener('resize', updateParentHeight);
            
            // Update height when images load
            document.querySelectorAll('img').forEach(img => {
              if (img.complete) {
                updateParentHeight();
              } else {
                img.addEventListener('load', updateParentHeight);
              }
            });
            
            // Force another update after a delay to catch any late-loading content
            setTimeout(updateParentHeight, 1000);
          });
        </script>
      </body>
    </html>
  `
}
