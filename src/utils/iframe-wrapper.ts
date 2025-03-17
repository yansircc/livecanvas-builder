export function IframeWrapper(content: string, themeCSS?: string, previewMode = false) {
  // Import the style preview markup if in preview mode
  const contentToRender = previewMode
    ? `
      <!-- Style Preview Component -->
      <div class="p-4">
        <h1 class="text-3xl mb-3">Style Preview</h1>
        <p class="mb-4">Change the customization options above to see live updates.</p>
        
        <div class="mb-5">
          <h2 class="text-xl mb-2">Typography</h2>
          <h1 class="text-4xl mb-2">Heading 1</h1>
          <h2 class="text-3xl mb-2">Heading 2</h2>
          <h3 class="text-2xl mb-2">Heading 3</h3>
          <p class="mb-2">Regular paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <a href="#" class="text-primary">This is a link</a>
        </div>
        
        <div class="mb-5">
          <h2 class="text-xl mb-3">Buttons</h2>
          <div class="d-flex flex-wrap gap-2 mb-3">
            <button class="btn btn-primary">Primary Button</button>
            <button class="btn btn-secondary">Secondary Button</button>
            <button class="btn btn-outline-primary">Outline Button</button>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-sm btn-primary">Small</button>
            <button class="btn btn-primary">Medium</button>
            <button class="btn btn-lg btn-primary">Large</button>
          </div>
        </div>
        
        <div class="mb-5">
          <h2 class="text-xl mb-3">Colors</h2>
          <div class="d-flex flex-wrap gap-2 mb-3">
            <div class="p-4 bg-primary text-white rounded">Primary</div>
            <div class="p-4 bg-secondary text-white rounded">Secondary</div>
            <div class="p-4 border border-primary text-primary rounded">Primary Border</div>
          </div>
        </div>
        
        <div class="mb-5">
          <h2 class="text-xl mb-3">Images</h2>
          <div class="row">
            <div class="col-md-4 mb-3">
              <img 
                src="/images/placeholder/1.svg" 
                alt="Nature" 
                class="img-fluid mb-2" 
              />
              <p class="small text-muted">Nature Image</p>
            </div>
            <div class="col-md-4 mb-3">
              <img 
                src="/images/placeholder/2.svg" 
                alt="City" 
                class="img-fluid mb-2" 
              />
              <p class="small text-muted">City Image</p>
            </div>
            <div class="col-md-4 mb-3">
              <img 
                src="/images/placeholder/3.svg" 
                alt="People" 
                class="img-fluid mb-2" 
              />
              <p class="small text-muted">People Image</p>
            </div>
          </div>
        </div>
        
        <div class="mb-5">
          <h2 class="text-xl mb-3">Card Components</h2>
          <div class="row">
            <div class="col-md-4 mb-3">
              <div class="card">
                <img 
                  src="/images/placeholder/4.svg" 
                  alt="Card image" 
                  class="card-img-top" 
                />
                <div class="card-body">
                  <h5 class="card-title">Card Title</h5>
                  <p class="card-text">Some quick example text to build on the card title.</p>
                  <button class="btn btn-primary">Button</button>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Feature Card</h5>
                  <p class="card-text">A card without an image showing text content only.</p>
                  <button class="btn btn-outline-primary">Learn More</button>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="card text-center">
                <div class="card-header">Featured</div>
                <div class="card-body">
                  <h5 class="card-title">Special Card</h5>
                  <p class="card-text">With header and footer sections.</p>
                  <button class="btn btn-primary">Go somewhere</button>
                </div>
                <div class="card-footer text-muted">2 days ago</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mb-5">
          <h2 class="text-xl mb-3">Alerts and Notices</h2>
          <div class="alert alert-primary mb-2" role="alert">
            This is a primary alert — check it out!
          </div>
          <div class="alert alert-secondary mb-2" role="alert">
            This is a secondary alert — check it out!
          </div>
          <div class="alert alert-success mb-2" role="alert">
            Success! Your changes have been saved.
          </div>
        </div>
      </div>
    `
    : content

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
        
        <!-- Extended Google Fonts collection -->
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Montserrat:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" crossorigin="anonymous">
        
        <!-- Bootstrap JS with crossorigin anonymous -->
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" 
                crossorigin="anonymous"></script>
        
        <!-- AOS animations -->
        <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" crossorigin="anonymous">
        
        <!-- Custom theme styles -->
        <style id="theme-styles">
          ${themeCSS || ''}
        </style>
      </head>
      <body>
        <div class="bootstrap-preview">
          ${contentToRender}
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

            // Listen for theme changes from parent window
            window.addEventListener('message', function(event) {
              if (event.data && event.data.type === 'themeChange') {
                // Update theme styles
                const themeStyles = document.getElementById('theme-styles');
                if (themeStyles) {
                  themeStyles.textContent = event.data.css || '';
                }
              }
            });
          });
        </script>
      </body>
    </html>
  `
}
