"use client";

import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { FONT_OPTIONS } from "../lib/fonts";

interface FontSelectionProps {
	selectedFonts: {
		heading: string;
		body: string;
		mono: string;
	};
	onFontChange: (type: "heading" | "body" | "mono", font: string) => void;
}

export function FontSelection({
	selectedFonts,
	onFontChange,
}: FontSelectionProps) {
	const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());

	// Load Google Fonts for preview
	useEffect(() => {
		// Create a function to load a font
		const loadFont = (fontName: string) => {
			if (loadedFonts.has(fontName)) return;

			const link = document.createElement("link");
			link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(
				/ /g,
				"+",
			)}:wght@400;700&display=swap`;
			link.rel = "stylesheet";
			document.head.appendChild(link);

			// Add to loaded fonts
			setLoadedFonts((prev) => new Set([...prev, fontName]));
		};

		// Load all fonts for preview
		[
			...FONT_OPTIONS.heading,
			...FONT_OPTIONS.body,
			...FONT_OPTIONS.mono,
		].forEach(loadFont);

		// Always load selected fonts to ensure they're available for preview
		loadFont(selectedFonts.heading);
		loadFont(selectedFonts.body);
		loadFont(selectedFonts.mono);
	}, [selectedFonts, loadedFonts]);

	// Font card component for selection
	const FontCard = ({
		font,
		selected,
		type,
		sampleText,
	}: {
		font: string;
		selected: boolean;
		type: "heading" | "body" | "mono";
		sampleText: string;
	}) => (
		<button
			type="button"
			onClick={() => onFontChange(type, font)}
			className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-md border p-3 text-center transition-all hover:bg-gray-100 dark:hover:bg-zinc-900 ${
				selected
					? "border-primary bg-primary/5 ring-1 ring-primary"
					: "border-gray-200 hover:border-gray-300 dark:border-zinc-800 dark:hover:border-zinc-700"
			}`}
		>
			<div className="space-y-1">
				<div style={{ fontFamily: font }} className="font-medium text-sm">
					{font}
				</div>
				<div
					className="text-muted-foreground text-xs"
					style={{ fontFamily: font }}
				>
					{sampleText}
				</div>
			</div>
		</button>
	);

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<div>
					<Label className="mb-2 block">标题字体</Label>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
						{FONT_OPTIONS.heading.map((font) => (
							<FontCard
								key={`heading-${font}`}
								font={font}
								selected={selectedFonts.heading === font}
								type="heading"
								sampleText="Aa Bb Cc"
							/>
						))}
					</div>
				</div>

				<div>
					<Label className="mb-2 block">正文字体</Label>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
						{FONT_OPTIONS.body.map((font) => (
							<FontCard
								key={`body-${font}`}
								font={font}
								selected={selectedFonts.body === font}
								type="body"
								sampleText="Text & Paragraphs"
							/>
						))}
					</div>
				</div>

				<div>
					<Label className="mb-2 block">等宽字体</Label>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
						{FONT_OPTIONS.mono.map((font) => (
							<FontCard
								key={`mono-${font}`}
								font={font}
								selected={selectedFonts.mono === font}
								type="mono"
								sampleText="code {}"
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
