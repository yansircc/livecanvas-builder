import { getIconSvg } from "./get-icon-svg";

/**
 * Utility to process HTML by replacing Lucide icon tags with SVG content
 * while preserving all classes and styles using a wrapper element
 */

/**
 * Make SVG responsive to parent styling by removing fixed dimensions
 * and adding appropriate style attributes
 */
function makeResponsiveSvg(svg: string): string {
	// Remove fixed width and height attributes
	let responsiveSvg = svg.replace(/\s+width="[^"]*"/, " ");
	responsiveSvg = responsiveSvg.replace(/\s+height="[^"]*"/, " ");

	// Add styles to make SVG scale with parent font-size
	// We keep the viewBox to maintain aspect ratio
	return responsiveSvg.replace(
		"<svg",
		'<svg style="width: 1em; height: 1em; vertical-align: -0.125em;"',
	);
}

/**
 * Process HTML by replacing <i class="lucide-*"></i> tags with SVG content
 * wrapped in a span that preserves the original styling
 */
export function processHtml(html: string | undefined | null): string {
	try {
		// Ensure html is a string
		if (!html || typeof html !== "string") {
			console.warn("processHtml received non-string input:", html);
			return "";
		}

		// Process icons with double quotes for class
		let processedHtml = html.replace(
			/<i\s+class="([^"]*lucide-([^"\s]+)[^"]*)"([^>]*)><\/i>/gi,
			(match, fullClass, iconName, attributes) => {
				const svg = getIconSvg(iconName);
				if (!svg) {
					return `<span class="icon-placeholder">${iconName}</span>`;
				}

				// Make the SVG responsive to parent styling
				const responsiveSvg = makeResponsiveSvg(svg);

				// Create a wrapper to preserve all attributes from the original element
				let wrapperAttrs = `class="${fullClass}"`;

				// Extract any other attributes
				const styleMatch = attributes.match(/style="([^"]*)"/);
				if (styleMatch) {
					wrapperAttrs += ` style="${styleMatch[1]}"`;
				}

				// Add any other attributes that might be present
				const additionalAttrs = attributes.replace(/style="[^"]*"/, "").trim();
				if (additionalAttrs) {
					wrapperAttrs += ` ${additionalAttrs}`;
				}

				// Return SVG wrapped in a span with all original attributes
				return `<span ${wrapperAttrs}>${responsiveSvg}</span>`;
			},
		);

		// Also process icons with single quotes for class
		processedHtml = processedHtml.replace(
			/<i\s+class='([^']*lucide-([^'\s]+)[^']*)'([^>]*)><\/i>/gi,
			(match, fullClass, iconName, attributes) => {
				const svg = getIconSvg(iconName);
				if (!svg) {
					return `<span class="icon-placeholder">${iconName}</span>`;
				}

				// Make the SVG responsive to parent styling
				const responsiveSvg = makeResponsiveSvg(svg);

				// Create a wrapper to preserve all attributes from the original element
				let wrapperAttrs = `class='${fullClass}'`;

				// Extract style attribute if it exists with either quote type
				const styleMatch = attributes.match(/style=["']([^"']*)["']/);
				if (styleMatch) {
					wrapperAttrs += ` style="${styleMatch[1]}"`;
				}

				// Add any other attributes that might be present
				const additionalAttrs = attributes
					.replace(/style=["'][^"']*["']/, "")
					.trim();
				if (additionalAttrs) {
					wrapperAttrs += ` ${additionalAttrs}`;
				}

				// Return SVG wrapped in a span with all original attributes
				return `<span ${wrapperAttrs}>${responsiveSvg}</span>`;
			},
		);

		return processedHtml;
	} catch (error) {
		console.error("Error processing HTML:", error);
		return typeof html === "string" ? html : "";
	}
}
