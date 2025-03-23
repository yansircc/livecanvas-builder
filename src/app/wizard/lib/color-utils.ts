/**
 * Color utility functions for converting between color formats and creating variations
 */

/**
 * Normalizes a hue value to be between 0-360
 */
export function normalizeHue(hue: number): number {
	return ((hue % 360) + 360) % 360;
}

/**
 * Standardizes OKLCH format to ensure consistency across all functions
 * @param oklch OKLCH color string in any valid format
 * @returns Standardized OKLCH string in format "oklch(XX% Y.YYY Z.ZZZ)"
 */
export function standardizeOklchFormat(oklch: string): string {
	if (!oklch.startsWith("oklch")) {
		return "oklch(0% 0 0)"; // Default to black if not OKLCH
	}

	// Handle different OKLCH formats
	// Format 1: oklch(XX% Y.YYY Z.ZZZ) - with percent sign for lightness
	const formatWithPercent = /oklch\(([0-9.]+)%\s+([0-9.]+)\s+([0-9.]+)\)/;
	// Format 2: oklch(X.XXX Y.YYY Z.ZZZ) - without percent sign for lightness
	const formatWithoutPercent = /oklch\(([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\)/;

	let match = oklch.match(formatWithPercent);
	if (match && match.length >= 4) {
		const lightness = Number.parseFloat(match[1] || "0");
		const chroma = Number.parseFloat(match[2] || "0");
		const hue = Number.parseFloat(match[3] || "0");
		return `oklch(${lightness.toFixed(3)}% ${chroma.toFixed(3)} ${hue.toFixed(
			3,
		)})`;
	}

	match = oklch.match(formatWithoutPercent);
	if (match && match.length >= 4) {
		// If format without percent, assume lightness is 0-1 and convert to percent
		const lightness = Number.parseFloat(match[1] || "0") * 100;
		const chroma = Number.parseFloat(match[2] || "0");
		const hue = Number.parseFloat(match[3] || "0");
		return `oklch(${lightness.toFixed(3)}% ${chroma.toFixed(3)} ${hue.toFixed(
			3,
		)})`;
	}

	return "oklch(0% 0 0)"; // Default to black if parsing fails
}

/**
 * Extract hue from a hex color
 * @param hex Hex color string
 * @returns Hue value (0-360)
 */
export function extractHueFromHex(hex: string): number {
	// Extract rgb values
	let r = 0;
	let g = 0;
	let b = 0;

	if (!hex[1] || !hex[2] || !hex[3]) {
		return 0;
	}

	// Handle shorthand hex format (#rgb)
	if (hex.length === 4) {
		r = Number.parseInt(hex[1] + hex[1], 16) || 0;
		g = Number.parseInt(hex[2] + hex[2], 16) || 0;
		b = Number.parseInt(hex[3] + hex[3], 16) || 0;
	}
	// Handle normal hex format (#rrggbb)
	else if (hex.length === 7) {
		r = Number.parseInt(hex.substring(1, 3), 16) || 0;
		g = Number.parseInt(hex.substring(3, 5), 16) || 0;
		b = Number.parseInt(hex.substring(5, 7), 16) || 0;
	}

	// Normalize rgb values to 0-1
	const rNorm = r / 255;
	const gNorm = g / 255;
	const bNorm = b / 255;

	// Calculate chroma and hue
	const max = Math.max(rNorm, gNorm, bNorm);
	const min = Math.min(rNorm, gNorm, bNorm);
	const chroma = max - min;

	let hue = 0;
	if (chroma !== 0) {
		if (max === rNorm) {
			hue = ((gNorm - bNorm) / chroma) % 6;
		} else if (max === gNorm) {
			hue = (bNorm - rNorm) / chroma + 2;
		} else {
			hue = (rNorm - gNorm) / chroma + 4;
		}

		hue = normalizeHue(hue * 60);
	}

	return hue;
}

/**
 * Extracts lightness from a hex color
 * @param hex Hex color string
 * @returns Lightness value (0-1)
 */
export function extractLightnessFromHex(hex: string): number {
	let r = 0;
	let g = 0;
	let b = 0;

	if (!hex[1] || !hex[2] || !hex[3]) {
		return 0;
	}

	// Handle shorthand hex format (#rgb)
	if (hex.length === 4) {
		r = Number.parseInt(hex[1] + hex[1], 16) || 0;
		g = Number.parseInt(hex[2] + hex[2], 16) || 0;
		b = Number.parseInt(hex[3] + hex[3], 16) || 0;
	}
	// Handle normal hex format (#rrggbb)
	else if (hex.length === 7) {
		r = Number.parseInt(hex.substring(1, 3), 16) || 0;
		g = Number.parseInt(hex.substring(3, 5), 16) || 0;
		b = Number.parseInt(hex.substring(5, 7), 16) || 0;
	}

	// Normalize rgb values to 0-1
	const rNorm = r / 255;
	const gNorm = g / 255;
	const bNorm = b / 255;

	// Perceptual lightness formula
	return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;
}

/**
 * Extracts chroma from a hex color
 * @param hex Hex color string
 * @returns Chroma value (0-1)
 */
export function extractChromaFromHex(hex: string): number {
	let r = 0;
	let g = 0;
	let b = 0;

	if (!hex[1] || !hex[2] || !hex[3]) {
		return 0;
	}

	// Handle shorthand hex format (#rgb)
	if (hex.length === 4) {
		r = Number.parseInt(hex[1] + hex[1], 16) || 0;
		g = Number.parseInt(hex[2] + hex[2], 16) || 0;
		b = Number.parseInt(hex[3] + hex[3], 16) || 0;
	}
	// Handle normal hex format (#rrggbb)
	else if (hex.length === 7) {
		r = Number.parseInt(hex.substring(1, 3), 16) || 0;
		g = Number.parseInt(hex.substring(3, 5), 16) || 0;
		b = Number.parseInt(hex.substring(5, 7), 16) || 0;
	}

	// Normalize rgb values to 0-1
	const rNorm = r / 255;
	const gNorm = g / 255;
	const bNorm = b / 255;

	// Calculate chroma as distance between min and max channel
	const max = Math.max(rNorm, gNorm, bNorm);
	const min = Math.min(rNorm, gNorm, bNorm);
	return max - min;
}

/**
 * Extracts oklch components from an oklch color string
 * @param oklch OKLCH color string in any format
 * @returns Object with lightness, chroma, and hue values
 */
export function extractOklchComponents(oklch: string): {
	lightness: number;
	chroma: number;
	hue: number;
} {
	// Standardize the format first
	const standardOklch = standardizeOklchFormat(oklch);

	// Extract components from standardized format
	const regex = /oklch\(([0-9.]+)%\s+([0-9.]+)\s+([0-9.]+)\)/;
	const match = standardOklch.match(regex);

	if (!match || match.length < 4) {
		return { lightness: 0, chroma: 0, hue: 0 };
	}

	return {
		lightness: Number.parseFloat(match[1] || "0"),
		chroma: Number.parseFloat(match[2] || "0"),
		hue: Number.parseFloat(match[3] || "0"),
	};
}

/**
 * Converts a hex color string to OKLCH format
 * This is a simplified version - in a production app, you would use a proper color conversion library
 * @param hex The hex color to convert (e.g., "#FF5500" or "#f50")
 * @returns OKLCH color string in format "oklch(l% c h)"
 */
export function hexToOklch(hex: string): string {
	// If already in OKLCH format, standardize it
	if (hex.startsWith("oklch")) {
		return standardizeOklchFormat(hex);
	}

	// First convert hex to RGB
	let r = 0;
	let g = 0;
	let b = 0;

	if (!hex[1] || !hex[2] || !hex[3]) {
		return "oklch(0% 0 0)";
	}

	// Handle shorthand hex format (#rgb)
	if (hex.length === 4) {
		r = Number.parseInt(hex[1] + hex[1], 16) || 0;
		g = Number.parseInt(hex[2] + hex[2], 16) || 0;
		b = Number.parseInt(hex[3] + hex[3], 16) || 0;
	}
	// Handle normal hex format (#rrggbb)
	else if (hex.length === 7) {
		r = Number.parseInt(hex.substring(1, 3), 16) || 0;
		g = Number.parseInt(hex.substring(3, 5), 16) || 0;
		b = Number.parseInt(hex.substring(5, 7), 16) || 0;
	}

	// For this simplified implementation, we'll create a rough approximation of OKLCH
	// We'll normalize RGB values to 0-1
	const rNorm = r / 255;
	const gNorm = g / 255;
	const bNorm = b / 255;

	// Calculate a simple lightness (l) value - weighted average
	const lightness = 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm;

	// Calculate a simple chroma (c) value - max distance between channels
	const chroma =
		Math.max(Math.max(rNorm, gNorm), bNorm) -
		Math.min(Math.min(rNorm, gNorm), bNorm);

	// Calculate a simple hue (h) value
	let hue = 0;
	if (chroma !== 0) {
		const maxRGB = Math.max(rNorm, gNorm, bNorm);
		if (maxRGB === rNorm) {
			hue = ((gNorm - bNorm) / chroma) % 6;
		} else if (maxRGB === gNorm) {
			hue = (bNorm - rNorm) / chroma + 2;
		} else {
			hue = (rNorm - gNorm) / chroma + 4;
		}

		hue = hue * 60;
		if (hue < 0) {
			hue += 360;
		}
	}

	// Format as OKLCH string (simplified approximation)
	return `oklch(${Math.round(lightness * 100)}% ${chroma.toFixed(
		3,
	)} ${hue.toFixed(3)})`;
}

/**
 * Creates a color variant based on the primary color, useful for generating related colors
 * @param oklch The base OKLCH color string
 * @param lightnessAdjust Amount to adjust lightness (positive = lighter, negative = darker)
 * @param chromaAdjust Amount to adjust chroma (positive = more saturated, negative = less saturated)
 * @param hueAdjust Amount to adjust hue in degrees
 * @returns A new OKLCH color string
 */
export function createColorVariant(
	oklch: string,
	lightnessAdjust = 0,
	chromaAdjust = 0,
	hueAdjust = 0,
): string {
	// Extract components using standardized approach
	const { lightness, chroma, hue } = extractOklchComponents(oklch);

	// Apply adjustments
	const newLightness = Math.max(0, Math.min(100, lightness + lightnessAdjust));
	const newChroma = Math.max(0, chroma + chromaAdjust);
	const newHue = normalizeHue(hue + hueAdjust);

	// Return new OKLCH string
	return `oklch(${newLightness.toFixed(3)}% ${newChroma.toFixed(
		3,
	)} ${newHue.toFixed(3)})`;
}

/**
 * 生成与给定背景色形成良好对比的内容色
 * @param backgroundColor 以 OKLCH 格式表示的背景色
 * @returns 一个对比度较高且与背景色稍微相关的内容色，OKLCH 格式
 */
export function generateContentColor(backgroundColor: string): string {
	// 提取 OKLCH 组件
	const { lightness, chroma, hue } = extractOklchComponents(backgroundColor);

	// 设定合理的临界点
	const THRESHOLD = 60;

	// 限制色度，保证颜色和背景稍微相关，但不过分饱和
	const contentChroma = Math.min(chroma, 0.03) + 0.02;

	if (lightness > THRESHOLD) {
		// 背景较亮：生成接近黑色的内容色（极深）
		return `oklch(3% ${contentChroma.toFixed(3)} ${hue.toFixed(3)})`;
	}

	// 背景较暗：生成接近白色的内容色（极淡）
	return `oklch(97% ${contentChroma.toFixed(3)} ${hue.toFixed(3)})`;
}

/**
 * Generates base colors derived from the primary color
 * @param primaryColor The primary color in OKLCH format
 * @returns Object with base colors in OKLCH format
 */
export function generateBaseColors(primaryColor: string): {
	base100: string;
	base200: string;
	base300: string;
	baseContent: string;
} {
	// Extract components using standardized approach
	const { chroma, hue } = extractOklchComponents(primaryColor);

	// For light theme, base colors should be very light
	// but slightly influenced by the primary color
	const base100 = `oklch(98% ${(chroma * 0.06).toFixed(3)} ${hue.toFixed(3)})`;
	const base200 = `oklch(96% ${(chroma * 0.12).toFixed(3)} ${hue.toFixed(3)})`;
	const base300 = `oklch(94% ${(chroma * 0.18).toFixed(3)} ${hue.toFixed(3)})`;

	// Content should be dark for good contrast with light backgrounds
	// const baseContent = `oklch(21% ${(chroma * 0.05).toFixed(3)} ${normalizeHue(hue + 180).toFixed(3)})`
	const baseContent = `oklch(21% ${(chroma * 0.8).toFixed(3)} ${hue.toFixed(
		3,
	)})`;

	return { base100, base200, base300, baseContent };
}

/**
 * Generates dark theme base colors derived from the primary color
 * @param primaryColor The primary color in OKLCH format
 * @returns Object with dark theme base colors in OKLCH format
 */
export function generateDarkBaseColors(primaryColor: string): {
	base100: string;
	base200: string;
	base300: string;
	baseContent: string;
} {
	// Extract components using standardized approach
	const { chroma, hue } = extractOklchComponents(primaryColor);

	// For dark theme, base colors should be very dark
	// but slightly influenced by the primary color
	const darkHue = normalizeHue(hue - 30); // Shift hue slightly for dark theme
	const base100 = `oklch(25% ${(chroma * 0.1).toFixed(3)} ${darkHue.toFixed(
		3,
	)})`; // Dark background
	const base200 = `oklch(23% ${(chroma * 0.08).toFixed(3)} ${darkHue.toFixed(
		3,
	)})`; // Slightly darker
	const base300 = `oklch(21% ${(chroma * 0.06).toFixed(3)} ${darkHue.toFixed(
		3,
	)})`; // Even darker

	// Content should be light for good contrast with dark backgrounds
	const baseContent = `oklch(98% ${(chroma * 0.05).toFixed(3)} ${(
		darkHue + 5
	).toFixed(3)})`;

	return { base100, base200, base300, baseContent };
}

/**
 * 基于色彩学理论生成主色的配色方案
 * @param primaryColor 以 hex 格式表示的主色
 * @returns 包含各配色方案的数组，每个方案包含名称、描述以及三种颜色（主色、辅助色、点缀色）
 */
export function generateColorHarmonies(primaryColor: string): Array<{
	name: string;
	description: string;
	colors: {
		primary: string;
		secondary: string;
		accent: string;
	};
}> {
	// 将主色转换为 OKLCH 格式，方便基于色相、亮度和饱和度的调整
	const primaryOklch = hexToOklch(primaryColor);

	// 返回的配色方案均基于色彩学中的经典理论
	return [
		{
			name: "互补色",
			description:
				"基于互补色理论，采用色轮上180°对立的颜色，形成鲜明对比的配色方案。",
			colors: {
				// 主色保持原样
				primary: primaryOklch,
				// 互补色：色相旋转180°
				secondary: createColorVariant(primaryOklch, 0, 0, 180),
				// 变体：在互补色基础上略微降低亮度，增加细节层次
				accent: createColorVariant(primaryOklch, -10, 0.02, 180),
			},
		},
		{
			name: "相似色",
			description:
				"基于相似色理论，选择主色两侧30°范围内的颜色，营造和谐、宁静的视觉效果。",
			colors: {
				primary: primaryOklch,
				// 顺时针偏移30°，略微提高亮度
				secondary: createColorVariant(primaryOklch, 5, -0.02, 30),
				// 逆时针偏移30°，略微降低亮度
				accent: createColorVariant(primaryOklch, -5, 0.02, -30),
			},
		},
		{
			name: "三色",
			description:
				"基于三色理论，使用色轮上均匀分布（120°间隔）的颜色，平衡且充满活力。",
			colors: {
				primary: primaryOklch,
				// 第二个颜色：色相加120°
				secondary: createColorVariant(primaryOklch, 0, 0, 120),
				// 第三个颜色：色相加240°（或减120°）
				accent: createColorVariant(primaryOklch, 0, 0, 240),
			},
		},
		{
			name: "分裂互补色",
			description:
				"在互补色基础上向两侧各偏移30°，既保留对比又降低紧张感，形成更柔和的配色。",
			colors: {
				primary: primaryOklch,
				// 分裂互补：色相在互补色基础上减30°
				secondary: createColorVariant(primaryOklch, 0, 0, 150),
				// 分裂互补：色相在互补色基础上加30°
				accent: createColorVariant(primaryOklch, 0, 0, 210),
			},
		},
		{
			name: "单色",
			description:
				"基于单色理论，通过调整亮度和饱和度生成主色的不同变体，层次丰富又统一。",
			colors: {
				primary: primaryOklch,
				// 更明亮的变体：增加亮度，适当降低饱和度
				secondary: createColorVariant(primaryOklch, 15, -0.05, 0),
				// 更深邃的变体：降低亮度，适当增加饱和度
				accent: createColorVariant(primaryOklch, -15, 0.05, 0),
			},
		},
	];
}
