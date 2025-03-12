export function IframeWrapper(content: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HTML 预览</title>
        
        <!-- Bootstrap CSS with crossorigin anonymous -->
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" 
              rel="stylesheet" 
              crossorigin="anonymous">
        
        <!-- Bootstrap JS with crossorigin anonymous -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" 
                crossorigin="anonymous"></script>
        
        <!-- AOS animations -->
        <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" crossorigin="anonymous">
        
        <!-- Google Fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet" crossorigin="anonymous">
      </head>
      <body>
        <div class="bootstrap-preview">
          ${content}
        </div>
        
        <!-- AOS animations script -->
        <script src="https://unpkg.com/aos@2.3.1/dist/aos.js" crossorigin="anonymous"></script>
        
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            // Check if Bootstrap CSS loaded properly
            function checkBootstrapLoaded() {
              // Test if a Bootstrap class is applied correctly
              const testElement = document.createElement('div');
              testElement.className = 'mt-3';
              document.body.appendChild(testElement);
              
              const computedStyle = window.getComputedStyle(testElement);
              const hasMarginTop = computedStyle.marginTop !== '0px';
              
              document.body.removeChild(testElement);
              
              return hasMarginTop;
            }
            
            // Load Bootstrap CSS as fallback if CDN failed
            if (!checkBootstrapLoaded()) {
              console.warn('Bootstrap CSS not loaded from CDN, using fallback');
              
              // Fetch Bootstrap CSS directly
              fetch('https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css')
                .then(response => response.text())
                .then(css => {
                  const fallbackStyle = document.getElementById('bootstrap-fallback');
                  if (fallbackStyle) {
                    fallbackStyle.textContent = css;
                  }
                })
                .catch(error => console.error('Failed to load Bootstrap fallback:', error));
            }
            
            // Initialize AOS animations
            if (typeof AOS !== 'undefined') {
              AOS.init({
                duration: 800,
                once: false,
                mirror: true,
              });
            }
            
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
            if (typeof ResizeObserver !== 'undefined') {
              const resizeObserver = new ResizeObserver(() => {
                updateParentHeight();
              });
              
              resizeObserver.observe(document.body);
            }
            
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
