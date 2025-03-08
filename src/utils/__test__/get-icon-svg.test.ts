import { describe, expect, it } from "bun:test";
import getIconSvg from "../get-icon-svg";

describe("getIconSvg", () => {
	it("should return the correct SVG for an icon without prefix", () => {
		const svg = getIconSvg("arrow-right");
		expect(svg).toBeDefined();
		expect(typeof svg).toBe("string");
		expect(svg).toContain("<svg");
		expect(svg).toContain("</svg>");
	});

	it("should return the correct SVG for an icon with lucide prefix", () => {
		const svg = getIconSvg("lucide-arrow-right");
		expect(svg).toBeDefined();
		expect(svg).toContain("<svg");
		expect(svg).toContain("</svg>");
	});

	it("should handle fuzzy matching for icons with typos", () => {
		// Test with a minor typo (extra 't')
		const svgWithTypo = getIconSvg("arrow-rightt");
		expect(svgWithTypo).toBeDefined();
		expect(svgWithTypo).toContain("<svg");

		// Test with a minor typo and prefix
		const svgWithPrefixAndTypo = getIconSvg("lucide-arrow-rightt");
		expect(svgWithPrefixAndTypo).toBeDefined();
		expect(svgWithPrefixAndTypo).toContain("<svg");
	});

	it("should handle case insensitivity", () => {
		const svg1 = getIconSvg("ARROW-RIGHT");
		const svg2 = getIconSvg("Arrow-Right");

		expect(svg1).toBeDefined();
		expect(svg2).toBeDefined();
		expect(svg1).toEqual(svg2);
	});

	it("should return null if no icon is found", () => {
		const svg = getIconSvg("");
		expect(svg).toBeNull();
	});

	it("should handle edge cases", () => {
		// Empty string
		const emptyResult = getIconSvg("");
		expect(emptyResult).toBeNull();

		// Very short string (should not match any icon with high confidence)
		const shortResult = getIconSvg("a");
		expect(shortResult).toBeNull();

		// String with special characters
		const specialCharsResult = getIconSvg("arrow-right!@#");
		// Should still match "arrow-right" due to fuzzy matching
		expect(specialCharsResult).toBeDefined();
	});

	it("should work with various common icons", () => {
		// Test a few common icons to ensure they work
		const commonIcons = [
			"user",
			"home",
			"settings",
			"check",
			"x",
			"menu",
			"search",
		];

		for (const icon of commonIcons) {
			const svg = getIconSvg(icon);
			expect(svg).toBeDefined();
			expect(svg).toContain("<svg");
		}
	});

	it("should correctly match similar icon names", () => {
		// These are different icons but have similar names
		// The function should return the correct one based on the closest match
		const checkCircle = getIconSvg("check-circle");
		const circleCheck = getIconSvg("circle-check"); // This might exist in lucide

		// They should both return valid SVGs
		expect(checkCircle).toBeDefined();
		expect(checkCircle).toContain("<svg");

		// If circleCheck exists in lucide, it should be different from checkCircle
		if (circleCheck) {
			expect(circleCheck).toContain("<svg");
			// Ideally they should be different SVGs since they're different icons
			// But this depends on whether "circle-check" actually exists in lucide
		}
	});
});
