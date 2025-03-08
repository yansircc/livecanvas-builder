import { getIconSvg } from "./get-icon-svg";

/**
 * Utility to process HTML by replacing Lucide icon tags with SVG content
 */

/**
 * Process HTML by replacing <i class="lucide-*"></i> tags with SVG content
 */
export function processHtml(html: string | undefined | null): string {
	try {
		// Ensure html is a string
		if (!html || typeof html !== "string") {
			console.warn("processHtml received non-string input:", html);
			return "";
		}

		// First process icons with standard formatting
		let processedHtml = html.replace(
			/<i\s+class="([^"]*lucide-([^"\s]+)[^"]*)"([^>]*)><\/i>/gi,
			(match, fullClass, iconName, attributes) => {
				const svg = getIconSvg(iconName);
				if (svg) {
					// Extract style attribute if it exists
					const styleMatch = attributes.match(/style="([^"]*)"/);
					const style = styleMatch ? styleMatch[1] : "";

					// If there's a style attribute, inject it into the SVG
					if (style) {
						return svg.replace("<svg", `<svg style="${style}"`);
					}
					return svg;
				}
				return `<span class="icon-placeholder">${iconName}</span>`;
			},
		);

		// Also process icons defined with single quotes
		processedHtml = processedHtml.replace(
			/<i\s+class='([^']*lucide-([^'\s]+)[^']*)'([^>]*)><\/i>/gi,
			(match, fullClass, iconName, attributes) => {
				const svg = getIconSvg(iconName);
				if (svg) {
					// Extract style attribute if it exists
					const styleMatch = attributes.match(
						/style="([^"]*)"|style='([^']*)'/,
					);
					const style = styleMatch ? styleMatch[1] || styleMatch[2] : "";

					// If there's a style attribute, inject it into the SVG
					if (style) {
						return svg.replace("<svg", `<svg style="${style}"`);
					}
					return svg;
				}
				return `<span class="icon-placeholder">${iconName}</span>`;
			},
		);

		return processedHtml;
	} catch (error) {
		console.error("Error processing HTML:", error);
		return typeof html === "string" ? html : "";
	}
}
