import { z } from "zod";

export const codeSchema = z.object({
	code: z
		.string()
		.describe(
			"The HTML code, the copy should be English, and should start with a container, such as <section, <div, <article, etc.",
		),
	advices: z
		.array(z.string())
		.describe(
			"Advices for improving the HTML code, in Chinese, 3 unique & essential advices",
		),
});

export type CodeResponse = z.infer<typeof codeSchema>;
