"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface HashNavigationHandlerProps {
	iframeSelector?: string;
}

export function HashNavigationHandler({
	iframeSelector = "iframe",
}: HashNavigationHandlerProps) {
	const searchParams = useSearchParams();
	const pathname = usePathname();

	useEffect(() => {
		// Handle hash navigation within the iframe
		const handleHashChange = () => {
			const iframe = document.querySelector(
				iframeSelector,
			) as HTMLIFrameElement;
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
	}, [searchParams, pathname, iframeSelector]);

	return null;
}
