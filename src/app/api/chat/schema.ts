import { z } from "zod";

// Helper function to safely parse JSON strings
const safeJsonParse = (value: unknown): unknown => {
	if (typeof value !== "string") return value;

	try {
		const parsed = JSON.parse(value);
		return parsed;
	} catch (error) {
		// If it's not valid JSON, try to extract array items using regex
		// This handles cases where the AI returns a string like "['item1', 'item2']"
		try {
			const matches = value.match(/['"]([^'"]+)['"]/g);
			if (matches) {
				return matches.map((m) => m.replace(/['"]/g, ""));
			}
		} catch (e) {
			// Ignore regex errors
		}

		// If all else fails, wrap the string in an array
		return [value];
	}
};

export const codeSchema = z.object({
	code: z
		.string()
		.describe(
			"The HTML code, the copy should be English, and should start with a container, such as <section, <div, <article, etc.",
		),
	advices: z
		.preprocess(
			// First preprocess to handle string-to-array conversion
			(val) => safeJsonParse(val),
			// Then validate as array or transform single items into arrays
			z
				.union([
					z.array(z.string()),
					z.string().transform((s) => [s]),
					z.null().transform(() => []),
					z.undefined().transform(() => []),
				])
				.transform((val) => (Array.isArray(val) ? val : [val])),
		)
		.describe(
			"Advices for improving the HTML code, in Chinese, 3 unique & essential advices",
		),
});

export type CodeResponse = z.infer<typeof codeSchema>;
