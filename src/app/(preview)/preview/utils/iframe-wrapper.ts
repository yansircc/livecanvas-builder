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
        
        <!-- Critical Bootstrap CSS inline -->
        <style id="critical-bootstrap">
          /* Critical Bootstrap styles for common components */
          :root {
            --bs-blue: #0d6efd;
            --bs-indigo: #6610f2;
            --bs-purple: #6f42c1;
            --bs-pink: #d63384;
            --bs-red: #dc3545;
            --bs-orange: #fd7e14;
            --bs-yellow: #ffc107;
            --bs-green: #198754;
            --bs-teal: #20c997;
            --bs-cyan: #0dcaf0;
            --bs-white: #fff;
            --bs-gray: #6c757d;
            --bs-gray-dark: #343a40;
            --bs-primary: #0d6efd;
            --bs-secondary: #6c757d;
            --bs-success: #198754;
            --bs-info: #0dcaf0;
            --bs-warning: #ffc107;
            --bs-danger: #dc3545;
            --bs-light: #f8f9fa;
            --bs-dark: #212529;
          }
          
          /* Container */
          .container, .container-fluid {
            width: 100%;
            padding-right: var(--bs-gutter-x, 0.75rem);
            padding-left: var(--bs-gutter-x, 0.75rem);
            margin-right: auto;
            margin-left: auto;
          }
          
          /* Grid system */
          .row {
            --bs-gutter-x: 1.5rem;
            --bs-gutter-y: 0;
            display: flex;
            flex-wrap: wrap;
            margin-top: calc(-1 * var(--bs-gutter-y));
            margin-right: calc(-0.5 * var(--bs-gutter-x));
            margin-left: calc(-0.5 * var(--bs-gutter-x));
          }
          
          .col, .col-1, .col-2, .col-3, .col-4, .col-5, .col-6, 
          .col-7, .col-8, .col-9, .col-10, .col-11, .col-12 {
            position: relative;
            width: 100%;
            padding-right: calc(var(--bs-gutter-x) * 0.5);
            padding-left: calc(var(--bs-gutter-x) * 0.5);
          }
          
          .col { flex: 1 0 0%; }
          .col-1 { flex: 0 0 auto; width: 8.33333333%; }
          .col-2 { flex: 0 0 auto; width: 16.66666667%; }
          .col-3 { flex: 0 0 auto; width: 25%; }
          .col-4 { flex: 0 0 auto; width: 33.33333333%; }
          .col-5 { flex: 0 0 auto; width: 41.66666667%; }
          .col-6 { flex: 0 0 auto; width: 50%; }
          .col-7 { flex: 0 0 auto; width: 58.33333333%; }
          .col-8 { flex: 0 0 auto; width: 66.66666667%; }
          .col-9 { flex: 0 0 auto; width: 75%; }
          .col-10 { flex: 0 0 auto; width: 83.33333333%; }
          .col-11 { flex: 0 0 auto; width: 91.66666667%; }
          .col-12 { flex: 0 0 auto; width: 100%; }
          
          /* Utilities */
          .d-flex { display: flex !important; }
          .flex-column { flex-direction: column !important; }
          .justify-content-center { justify-content: center !important; }
          .align-items-center { align-items: center !important; }
          .text-center { text-align: center !important; }
          .mt-1 { margin-top: 0.25rem !important; }
          .mt-2 { margin-top: 0.5rem !important; }
          .mt-3 { margin-top: 1rem !important; }
          .mt-4 { margin-top: 1.5rem !important; }
          .mt-5 { margin-top: 3rem !important; }
          .mb-1 { margin-bottom: 0.25rem !important; }
          .mb-2 { margin-bottom: 0.5rem !important; }
          .mb-3 { margin-bottom: 1rem !important; }
          .mb-4 { margin-bottom: 1.5rem !important; }
          .mb-5 { margin-bottom: 3rem !important; }
          .p-1 { padding: 0.25rem !important; }
          .p-2 { padding: 0.5rem !important; }
          .p-3 { padding: 1rem !important; }
          .p-4 { padding: 1.5rem !important; }
          .p-5 { padding: 3rem !important; }
          
          /* Buttons */
          .btn {
            display: inline-block;
            font-weight: 400;
            line-height: 1.5;
            color: #212529;
            text-align: center;
            text-decoration: none;
            vertical-align: middle;
            cursor: pointer;
            user-select: none;
            background-color: transparent;
            border: 1px solid transparent;
            padding: 0.375rem 0.75rem;
            font-size: 1rem;
            border-radius: 0.25rem;
            transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
          }
          
          .btn-primary {
            color: #fff;
            background-color: #0d6efd;
            border-color: #0d6efd;
          }
          
          .btn-secondary {
            color: #fff;
            background-color: #6c757d;
            border-color: #6c757d;
          }
        </style>
        
        <!-- Inline Bootstrap CSS as fallback -->
        <style id="bootstrap-fallback">
          /* This will be replaced with Bootstrap CSS if CDN fails */
        </style>
        
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
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
