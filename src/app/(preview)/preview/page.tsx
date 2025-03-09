"use client";

import { processHtml } from "@/utils/process-html";
import { replaceImagePlaceholders } from "@/utils/replace-image-placeholders";
import { Check, Copy, Laptop, Smartphone, Tablet } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type DeviceType = "mobile" | "tablet" | "desktop";

interface DeviceConfig {
	width: string;
	height: string;
	label: string;
	icon: typeof Laptop | typeof Smartphone | typeof Tablet;
}

const deviceConfigs: Record<DeviceType, DeviceConfig> = {
	mobile: {
		width: "375px",
		height: "667px",
		label: "Mobile",
		icon: Smartphone,
	},
	tablet: {
		width: "768px",
		height: "1024px",
		label: "Tablet",
		icon: Tablet,
	},
	desktop: {
		width: "100%",
		height: "100%",
		label: "Desktop",
		icon: Laptop,
	},
};

export default function PreviewPage() {
	const searchParams = useSearchParams();
	const pathname = usePathname();
	const [content, setContent] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [device, setDevice] = useState<DeviceType>("desktop");
	const [copied, setCopied] = useState(false);

	// Create a unique key based on the full URL including hash
	const urlKey = typeof window !== "undefined" ? window.location.href : "";

	useEffect(() => {
		const contentId = searchParams.get("id");

		if (contentId) {
			const savedContent = localStorage.getItem(`preview_content_${contentId}`);

			if (savedContent) {
				try {
					const processedContent = processHtml(savedContent);
					setContent(processedContent);
				} catch (error) {
					console.error("Error processing HTML content:", error);
					setContent(savedContent);
				}
			} else {
				setContent(
					'<div class="error-container"><h3>Content Not Found</h3><p>The preview content is unavailable or has expired</p></div>',
				);
			}
		} else {
			setContent(
				'<div class="error-container"><h3>Invalid Request</h3><p>No preview content ID specified</p></div>',
			);
		}

		setLoading(false);

		// Handle hash navigation within the iframe
		const handleHashChange = () => {
			const iframe = document.querySelector("iframe");
			if (iframe?.contentWindow) {
				const hash = window.location.hash;
				if (hash) {
					// Navigate to the hash within the iframe instead of the parent page
					iframe.contentWindow.location.hash = hash.slice(1);
					// Reset the parent page hash to prevent duplication
					history.replaceState(
						null,
						"",
						`${pathname}?${searchParams.toString()}`,
					);
				}
			}
		};

		// Run once on mount to handle initial hash
		handleHashChange();

		// Listen for hash changes
		window.addEventListener("hashchange", handleHashChange);
		return () => {
			window.removeEventListener("hashchange", handleHashChange);
		};
	}, [searchParams, pathname]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent" />
			</div>
		);
	}

	const iframeContent = `
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
          
          .bootstrap-preview {
            max-width: 1200px;
            margin: 0 auto;
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

	const currentDevice = deviceConfigs[device];

	// Function to copy the HTML content with proper image URLs
	const copyHtmlContent = async () => {
		try {
			// Get the original content that was saved in localStorage
			const contentId = searchParams.get("id");
			let htmlContent = "";

			if (contentId) {
				// Get the original content from localStorage
				const savedContent = localStorage.getItem(
					`preview_content_${contentId}`,
				);
				if (savedContent) {
					// Use the original content from localStorage
					htmlContent = savedContent;
				}
			}

			// If we couldn't get the content from localStorage, use the iframe content
			if (!htmlContent) {
				// Try to get the content directly from the iframe if possible
				const iframe = document.querySelector("iframe");
				if (iframe?.contentDocument) {
					// Get only the content inside the bootstrap-preview div
					const previewContent =
						iframe.contentDocument.querySelector(".bootstrap-preview");
					if (previewContent) {
						htmlContent = previewContent.innerHTML;
					} else {
						// Fallback to the entire body content
						htmlContent = iframe.contentDocument.body.innerHTML;
					}
				} else {
					// Fallback to the iframe template
					htmlContent = iframeContent;
				}
			}

			// Replace image placeholder paths with CDN URLs
			const processedContent = replaceImagePlaceholders(htmlContent);

			await navigator.clipboard.writeText(processedContent);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy HTML content:", err);
		}
	};

	return (
		<div key={urlKey} className="flex flex-col h-screen bg-background">
			<div className="flex justify-between items-center px-6 py-3 border-b bg-white shadow-sm">
				<div className="flex items-center gap-4">
					<h1 className="text-2xl font-playfair tracking-tight font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
						HTML Preview
					</h1>
					<div className="flex items-center gap-2 border rounded-lg p-1 ml-4">
						{(
							Object.entries(deviceConfigs) as [DeviceType, DeviceConfig][]
						).map(([key, config]) => {
							const Icon = config.icon;
							return (
								<button
									key={key}
									type="button"
									onClick={() => setDevice(key)}
									className={`p-2 rounded-md transition-colors ${
										device === key
											? "bg-secondary text-secondary-foreground"
											: "hover:bg-secondary/50"
									}`}
									title={config.label}
								>
									<Icon className="h-4 w-4" />
								</button>
							);
						})}
					</div>
				</div>
				<button
					type="button"
					onClick={copyHtmlContent}
					className="px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md font-medium flex items-center gap-2"
					title={copied ? "Copied!" : "Copy HTML Code"}
				>
					{copied ? (
						<>
							<Check className="h-4 w-4 text-green-500" />
							<span>Copied!</span>
						</>
					) : (
						<>
							<Copy className="h-4 w-4" />
							<span>Copy Code</span>
						</>
					)}
				</button>
			</div>

			<div className="flex-1 p-4 flex items-center justify-center bg-muted/30">
				<div
					className="bg-background rounded-lg shadow-lg transition-all duration-300 overflow-hidden"
					style={{
						width: currentDevice.width,
						height: currentDevice.height,
					}}
				>
					<iframe
						srcDoc={iframeContent}
						className="w-full h-full border-0"
						title="HTML Preview"
					/>
				</div>
			</div>
		</div>
	);
}
