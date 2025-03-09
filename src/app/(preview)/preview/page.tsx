"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CopyButton } from "./components/copy-button";
import {
	DeviceSelector,
	type DeviceType,
	deviceConfigs,
} from "./components/device-selector";
import { HashNavigationHandler } from "./components/hash-navigation-handler";
import { LoadingSpinner } from "./components/loading-spinner";
import { PreviewFrame, getIframeContent } from "./components/preview-frame";
import {
	getOriginalContent,
	loadContentFromStorage,
} from "./utils/content-loader";
import { IframeWrapper } from "./utils/iframe-wrapper";

export default function PreviewPage() {
	const searchParams = useSearchParams();
	const contentId = searchParams.get("id");
	const [content, setContent] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [device, setDevice] = useState<DeviceType>("desktop");
	const iframeRef = useRef<HTMLIFrameElement>(null);

	// Create a unique key based on the full URL including hash
	const urlKey = typeof window !== "undefined" ? window.location.href : "";

	// Load content on mount
	useEffect(() => {
		const htmlContent = loadContentFromStorage(contentId);
		setContent(htmlContent);
		setLoading(false);
	}, [contentId]);

	// Handle device change
	const handleDeviceChange = (newDevice: DeviceType) => {
		setDevice(newDevice);
	};

	// Get content for copying
	const getContentToCopy = async (): Promise<string> => {
		// First try to get the original content from localStorage
		const originalContent = getOriginalContent(contentId);
		if (originalContent) {
			return originalContent;
		}

		// If we couldn't get the original content, try to get it from the iframe
		const iframe = document.querySelector("iframe") as HTMLIFrameElement;
		const iframeContent = getIframeContent(iframe);

		// If we got content from the iframe, return it
		if (iframeContent) {
			return iframeContent;
		}

		// Fallback to the iframe template
		return IframeWrapper(content);
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	const iframeContent = IframeWrapper(content);
	const currentDevice = deviceConfigs[device];

	return (
		<div key={urlKey} className="flex flex-col h-screen bg-background">
			{/* Header with title, device selector, and copy button */}
			<div className="flex justify-between items-center px-6 py-3 border-b bg-white shadow-sm">
				<div className="flex items-center gap-4">
					<h1 className="text-2xl font-playfair tracking-tight font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
						HTML Preview
					</h1>
					<div className="ml-4">
						<DeviceSelector
							onDeviceChange={handleDeviceChange}
							initialDevice={device}
						/>
					</div>
				</div>
				<CopyButton getContentToCopy={getContentToCopy} />
			</div>

			{/* Preview frame */}
			<PreviewFrame content={iframeContent} deviceConfig={currentDevice} />

			{/* Hash navigation handler */}
			<HashNavigationHandler />
		</div>
	);
}
