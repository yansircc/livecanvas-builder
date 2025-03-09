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
          });
        </script>
      </body>
    </html>
  `;
}
