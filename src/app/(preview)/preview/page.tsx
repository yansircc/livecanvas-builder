"use client";

import { processHtml } from "@/utils/process-html";
import { Laptop, Smartphone, Tablet } from "lucide-react";
import { useSearchParams } from "next/navigation";
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
	const [content, setContent] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [device, setDevice] = useState<DeviceType>("desktop");

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
	}, [searchParams]);

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
        <style>
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
          }
          
          body {
            padding: 1rem;
            font-family: system-ui, -apple-system, sans-serif;
          }
        </style>
      </head>
      <body>
        <div class="bootstrap-preview">
          ${content}
        </div>
      </body>
    </html>
  `;

	const currentDevice = deviceConfigs[device];

	return (
		<div className="flex flex-col h-screen bg-background">
			<div className="flex justify-between items-center px-4 py-2 border-b">
				<div className="flex items-center gap-4">
					<h1 className="text-xl font-semibold">HTML Preview</h1>
					<div className="flex items-center gap-2 border rounded-lg p-1">
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
					onClick={() => window.close()}
					className="px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md"
				>
					Close Preview
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
