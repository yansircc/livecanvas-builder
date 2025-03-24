/**
 * Creates JavaScript to handle Taos animations in the iframe preview
 * Uses the approach of adding styled padding areas to make the page scrollable
 */
export function createTaosInitScript(): string {
	return `
    // Add styled padding and initialize animations
    window.addEventListener('load', function() {
      // Create styles for the padding areas
      const style = document.createElement('style');
      style.textContent = \`
        .taos-padding-area {
          position: relative;
          height: 200px;
          margin: 20px;
          border: 2px dashed rgba(200, 200, 200, 0.5);
          border-radius: 8px;
          opacity: 0.7;
          pointer-events: none;
          overflow: hidden;
          background-image: repeating-linear-gradient(
            -45deg,
            rgba(200, 200, 200, 0.1),
            rgba(200, 200, 200, 0.1) 10px,
            rgba(240, 240, 240, 0.15) 10px,
            rgba(240, 240, 240, 0.15) 20px
          );
        }
        
        .taos-padding-area::after {
          content: "Scroll Area";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: sans-serif;
          font-size: 14px;
          color: rgba(150, 150, 150, 0.7);
          white-space: nowrap;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        
        .taos-top-padding::after {
          content: "Top Scroll Area";
        }
        
        .taos-bottom-padding::after {
          content: "Bottom Scroll Area";
        }
        
        @media (prefers-color-scheme: dark) {
          .taos-padding-area {
            border-color: rgba(100, 100, 100, 0.5);
            background-image: repeating-linear-gradient(
              -45deg,
              rgba(60, 60, 60, 0.2),
              rgba(60, 60, 60, 0.2) 10px,
              rgba(80, 80, 80, 0.3) 10px,
              rgba(80, 80, 80, 0.3) 20px
            );
          }
          
          .taos-padding-area::after {
            color: rgba(150, 150, 150, 0.5);
          }
        }
      \`;
      document.head.appendChild(style);
      
      // Create and add top padding element with styling
      const topPaddingElement = document.createElement('div');
      topPaddingElement.className = 'taos-padding-area taos-top-padding';
      document.body.insertBefore(topPaddingElement, document.body.firstChild);

      // Create and add bottom padding element with styling
      const bottomPaddingElement = document.createElement('div');
      bottomPaddingElement.className = 'taos-padding-area taos-bottom-padding';
      document.body.appendChild(bottomPaddingElement);
      
      // Force initial scroll to middle to ensure animations in viewport are triggered
      setTimeout(function() {
        // First, check if there are any Taos elements
        const taosElements = document.querySelectorAll('[data-taos-offset], [data-taos]');
        
        if (taosElements.length > 0) {
          // Get the first and last Taos elements
          const firstTaosEl = taosElements[0];
          const lastTaosEl = taosElements[taosElements.length - 1];
          
          // Calculate position to scroll to (mid-point between first and last)
          const firstRect = firstTaosEl.getBoundingClientRect();
          const lastRect = lastTaosEl.getBoundingClientRect();
          
          // Calculate middle position (offset from top of first element)
          const middlePosition = firstRect.top + (lastRect.bottom - firstRect.top) / 2;
          
          // Scroll to a position that ensures most elements are in view
          window.scrollTo({
            top: Math.max(0, middlePosition - window.innerHeight / 2),
            behavior: 'smooth'
          });
        } else {
          // If no Taos elements, just scroll to top
          window.scrollTo(0, 0);
        }
        
        // Dispatch a scroll event to trigger animations
        window.dispatchEvent(new Event('scroll'));
        
        // Update parent iframe height
        if (typeof updateHeight === 'function') {
          updateHeight();
        }
      }, 300);
    });
  `;
}
