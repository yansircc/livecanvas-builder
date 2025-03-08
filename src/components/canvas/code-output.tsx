"use client";

import { VersionSelector } from "@/components/canvas/version-selector";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/store/use-app-store";
import { Check, Copy, Eye } from "lucide-react";
import { useEffect, useState } from "react";

interface ValidationResult {
	valid: boolean;
	errors: string[];
}

interface CodeOutputProps {
	code: string;
	validationResult: ValidationResult;
}

export function CodeOutput({ code, validationResult }: CodeOutputProps) {
	const [copied, setCopied] = useState(false);
	const { processedHtml } = useAppStore();

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(processedHtml || code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy code:", err);
		}
	};

	const openPreview = () => {
		const contentId = Date.now().toString();
		localStorage.setItem(`preview_content_${contentId}`, processedHtml || code);
		window.open(`/preview?id=${contentId}`, "_blank");
	};

	// Function to truncate code for display
	const getDisplayCode = () => {
		if (!code) return "No code generated yet...";

		// Show only the first 15 lines of code
		const lines = code.split("\n");
		const visibleLines = lines.slice(0, 15);

		if (lines.length > 15) {
			return `${visibleLines.join("\n")}\n// ... more code hidden ...`;
		}

		return code;
	};

	// Effect to set the background RGB CSS variable
	useEffect(() => {
		// Get the computed background color
		const computedStyle = getComputedStyle(document.documentElement);
		const bgColor = computedStyle.getPropertyValue("--background").trim() || "";

		// Convert the background color to RGB format
		let rgb = [255, 255, 255]; // Default fallback

		if (bgColor.startsWith("#")) {
			// Handle hex format
			const hex = bgColor.substring(1);
			// Make sure we have enough characters
			if (hex.length >= 6) {
				rgb = [
					Number.parseInt(hex.slice(0, 2), 16),
					Number.parseInt(hex.slice(2, 4), 16),
					Number.parseInt(hex.slice(4, 6), 16),
				];
			}
		} else if (bgColor.startsWith("rgb")) {
			// Handle rgb/rgba format
			const matches = bgColor.match(/\d+/g);
			if (matches && matches.length >= 3) {
				rgb = [
					Number.parseInt(matches[0] || "0", 10),
					Number.parseInt(matches[1] || "0", 10),
					Number.parseInt(matches[2] || "0", 10),
				];
			}
		}

		// Set the RGB values as a CSS variable
		document.documentElement.style.setProperty(
			"--background-rgb",
			rgb.join(","),
		);

		// Clean up function
		return () => {
			document.documentElement.style.removeProperty("--background-rgb");
		};
	}, []);

	return (
		<Card className="overflow-hidden h-full">
			<div className="flex items-center justify-between p-4 bg-muted/50 border-b">
				<h2 className="text-lg font-semibold">Generated Code</h2>
				<div className="flex items-center gap-4">
					<VersionSelector />
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={openPreview}
							disabled={!code}
							title="Open Preview"
						>
							<Eye className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={copyToClipboard}
							disabled={!code}
							title={copied ? "Copied!" : "Copy Final HTML"}
						>
							{copied ? (
								<Check className="h-4 w-4 text-green-500" />
							) : (
								<Copy className="h-4 w-4" />
							)}
						</Button>
					</div>
				</div>
			</div>

			<div className="relative">
				{validationResult.errors.length > 0 && (
					<div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
						<div className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive">
							<h3 className="font-semibold mb-2">Validation Errors:</h3>
							<ul className="list-disc list-inside space-y-1">
								{validationResult.errors.map((error) => (
									<li key={error}>{error}</li>
								))}
							</ul>
						</div>
					</div>
				)}

				{/* Multi-layer gradient overlay for a more natural fade effect */}
				<div className="absolute inset-0 pointer-events-none z-10">
					{/* First layer - subtle fade starting from the top */}
					<div
						className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent"
						style={{
							background:
								"linear-gradient(to bottom, rgba(var(--background-rgb), 0) 0%, rgba(var(--background-rgb), 0.1) 30%)",
						}}
					/>

					{/* Second layer - middle fade */}
					<div
						className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent"
						style={{
							background:
								"linear-gradient(to bottom, rgba(var(--background-rgb), 0) 30%, rgba(var(--background-rgb), 0.4) 60%)",
						}}
					/>

					{/* Third layer - strong fade at the bottom */}
					<div
						className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent"
						style={{
							background:
								"linear-gradient(to bottom, rgba(var(--background-rgb), 0) 60%, rgba(var(--background-rgb), 0.9) 90%, rgba(var(--background-rgb), 1) 100%)",
						}}
					/>
				</div>

				<pre className="p-4 overflow-auto max-h-[calc(100vh-270px)] text-sm relative">
					<code className="block">{getDisplayCode()}</code>
				</pre>
			</div>
		</Card>
	);
}
