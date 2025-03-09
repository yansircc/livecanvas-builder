"use client";

import { useRef } from "react";
import type { DeviceConfig } from "./device-selector";

interface PreviewFrameProps {
	content: string;
	deviceConfig: DeviceConfig;
}

export function PreviewFrame({ content, deviceConfig }: PreviewFrameProps) {
	const iframeRef = useRef<HTMLIFrameElement>(null);

	return (
		<div className="flex-1 p-4 flex items-center justify-center bg-muted/30">
			<div
				className="bg-background rounded-lg shadow-lg transition-all duration-300 overflow-hidden"
				style={{
					width: deviceConfig.width,
					height: deviceConfig.height,
				}}
			>
				<iframe
					ref={iframeRef}
					srcDoc={content}
					className="w-full h-full border-0"
					title="HTML Preview"
				/>
			</div>
		</div>
	);
}

// Helper function to get content from the iframe
export function getIframeContent(iframe: HTMLIFrameElement | null): string {
	if (!iframe?.contentDocument) {
		return "";
	}

	// Try to get content from the bootstrap-preview div
	const previewContent =
		iframe.contentDocument.querySelector(".bootstrap-preview");
	if (previewContent) {
		return previewContent.innerHTML;
	}

	// Fallback to the entire body content
	return iframe.contentDocument.body.innerHTML || "";
}
