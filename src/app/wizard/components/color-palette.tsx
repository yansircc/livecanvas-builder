"use client";

import { cn } from "@/lib/utils";
import colors from "tailwindcss/colors";

// Filter out non-color properties and deprecated colors
const tailwindColorEntries = Object.entries(colors).filter(
	([colorName, value]) =>
		typeof value === "object" &&
		colorName !== "lightBlue" &&
		colorName !== "warmGray" &&
		colorName !== "trueGray" &&
		colorName !== "coolGray" &&
		colorName !== "blueGray",
);

interface ColorPaletteProps {
	onColorSelect: (color: string) => void;
	selectedColor: string | null;
}

export function ColorPalette({
	onColorSelect,
	selectedColor,
}: ColorPaletteProps) {
	return (
		<div className="space-y-6">
			<h3 className="font-medium text-lg">UI 颜色</h3>

			<div className="grid grid-cols-1 gap-1 md:grid-cols-22">
				{tailwindColorEntries.map(([colorName, colorObj]) => {
					// Skip if it's not an object with color shades
					if (typeof colorObj !== "object") return null;

					// Get the available shades (50, 100, etc)
					const shades = Object.entries(colorObj)
						.filter(([shade]) => !Number.isNaN(Number(shade))) // Only numeric keys
						.sort((a, b) => Number(a[0]) - Number(b[0])); // Sort by shade value

					return (
						<div
							key={colorName}
							className="flex flex-col items-center space-x-2"
						>
							<div className="flex flex-col gap-1">
								{shades.map(([shade, hexColor]) => {
									const isSelected = selectedColor === hexColor;

									return (
										<button
											key={`${colorName}-${shade}`}
											type="button"
											className={cn(
												"h-8 w-8 rounded-md border transition-all hover:scale-110 hover:shadow-md",
												isSelected ? "ring-2 ring-primary ring-offset-2" : "",
											)}
											style={{ backgroundColor: hexColor }}
											onClick={() => onColorSelect(hexColor)}
											title={`${colorName}-${shade}`}
											aria-label={`${colorName} ${shade}`}
										/>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
