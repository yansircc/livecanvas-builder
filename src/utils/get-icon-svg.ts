/**
 * @fileoverview Utility function to get an SVG string for a Lucide icon
 * @module utils/get-icon-svg
 */

import * as LucideIcons from "lucide-react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

/**
 * Simple similarity score between two strings (0-1)
 * Higher score means more similar
 */
function stringSimilarity(str1: string, str2: string): number {
	// If either string is empty, return 0
	if (str1.length === 0 || str2.length === 0) {
		return 0;
	}

	// Convert both strings to lowercase for case-insensitive comparison
	const s1 = str1.toLowerCase();
	const s2 = str2.toLowerCase();

	// Count common characters
	let matches = 0;
	const longerStr = s1.length > s2.length ? s1 : s2;
	const shorterStr = s1.length > s2.length ? s2 : s1;

	// Loop through each character in the shorter string
	for (let i = 0; i < shorterStr.length; i++) {
		const char = shorterStr[i];
		// Ensure char is defined before using includes
		if (char && longerStr.includes(char)) {
			matches++;
		}
	}

	// Calculate similarity score (0-1)
	return matches / longerStr.length;
}

/**
 * Convert kebab-case string to PascalCase
 * e.g., "arrow-right" becomes "ArrowRight"
 */
function kebabToPascalCase(input: string): string {
	return input
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join("");
}

/**
 * Extracts the icon name from a string like "lucide-arrow-right"
 */
function extractIconName(input: string): string {
	// Handle input formats like "lucide-arrow-right" or just "arrow-right"
	const iconPart = input.startsWith("lucide-") ? input.substring(7) : input;

	return kebabToPascalCase(iconPart);
}

/**
 * Finds the closest matching icon from Lucide icons
 */
function findClosestIcon(iconName: string): string | null {
	const availableIcons = Object.keys(LucideIcons);

	// If exact match exists, return it
	if (availableIcons.includes(iconName)) {
		return iconName;
	}

	// Find the closest match using string similarity
	let closestMatch = null;
	let highestSimilarity = 0;

	for (const icon of availableIcons) {
		// Skip non-icon exports that might be in the package
		if (icon === "createLucideIcon" || icon === "default") {
			continue;
		}

		const similarity = stringSimilarity(iconName, icon);

		if (similarity > highestSimilarity) {
			highestSimilarity = similarity;
			closestMatch = icon;
		}
	}

	// Return closest match if the similarity is high enough
	// (threshold can be adjusted based on requirements)
	return highestSimilarity > 0.5 ? closestMatch : null;
}

/**
 * Gets SVG string for a Lucide icon by name
 * Supports fuzzy matching for icon names
 *
 * @param iconName - String in format "lucide-arrow-right" or similar
 * @returns SVG string or null if no matching icon found
 */
export function getIconSvg(iconName: string): string | null {
	try {
		// Extract and convert the icon name
		const extractedName = extractIconName(iconName);

		// Find closest matching icon
		const closestIcon = findClosestIcon(extractedName);

		if (!closestIcon) {
			console.warn(`No matching icon found for: ${iconName}`);
			return null;
		}

		// Get the icon component
		const IconComponent = LucideIcons[
			closestIcon as keyof typeof LucideIcons
		] as React.FC;

		if (!IconComponent) {
			console.warn(`Icon component not found for: ${closestIcon}`);
			return null;
		}

		// Create element and render to string
		const element = createElement(IconComponent);
		const svgString = renderToString(element);

		return svgString;
	} catch (error) {
		console.error(`Error getting icon SVG for ${iconName}:`, error);
		return null;
	}
}
