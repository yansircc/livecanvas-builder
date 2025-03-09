export function IframeWrapper(content: string) {
	return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HTML Preview</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet">
        <style>
          :root {
            --font-heading: 'Playfair Display', serif;
            --font-body: 'Inter', system-ui, -apple-system, sans-serif;
            --color-text: #333;
            --color-heading: #111;
            --color-accent: #4f46e5;
            --color-link: #3b82f6;
          }
          
          .error-container {
            padding: 1.5rem;
            border-radius: 0.5rem;
            background-color: #fef2f2;
            border: 1px solid #fee2e2;
            color: #b91c1c;
            margin: 1rem 0;
          }
          
          .error-container h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            font-family: var(--font-heading);
          }
          
          body {
            padding: 1rem;
            font-family: var(--font-body);
            line-height: 1.7;
            color: var(--color-text);
            font-size: 1rem;
            background-color: #fff;
          }
          
          h1, h2, h3, h4, h5, h6 {
            font-family: var(--font-heading);
            font-weight: 600;
            line-height: 1.2;
            margin-bottom: 1rem;
            color: var(--color-heading);
            letter-spacing: -0.025em;
          }
          
          h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-top: 1.5rem;
          }
          
          h2 {
            font-size: 2rem;
            margin-top: 1.5rem;
          }
          
          h3 {
            font-size: 1.75rem;
            margin-top: 1.25rem;
          }
          
          p {
            margin-bottom: 1.5rem;
          }
          
          a {
            color: var(--color-link);
            text-decoration: none;
            transition: color 0.2s ease;
          }
          
          a:hover {
            color: var(--color-accent);
            text-decoration: underline;
          }
          
          /* Enhance Bootstrap components */
          .btn-primary {
            background-color: var(--color-accent);
            border-color: var(--color-accent);
          }
          
          .btn-primary:hover {
            background-color: #4338ca;
            border-color: #4338ca;
          }
          
          .card {
            border-radius: 0.5rem;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          
          .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          }
          
          /* Improve readability */
          .container, .container-fluid {
            padding-left: 1.5rem;
            padding-right: 1.5rem;
          }
          
          @media (min-width: 768px) {
            body {
              font-size: 1.05rem;
            }
            
            h1 {
              font-size: 3rem;
            }
            
            h2 {
              font-size: 2.25rem;
            }
            
            h3 {
              font-size: 1.875rem;
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
          });
        </script>
      </body>
    </html>
  `;
}
