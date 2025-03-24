import { z } from "zod";

export const metadataSchema = z.object({
	title: z
		.string()
		.describe(
			"A concise, descriptive Chinese title for the HTML content, between 5-20 characters",
		),
	description: z
		.string()
		.describe(
			"A detailed Chinese description of the HTML content, between 30-50 characters",
		),
	tags: z
		.array(z.string())
		.describe(
			"1-5 relevant Chinese tags for the HTML content, each between 2-5 characters",
		),
});

export type MetadataResponse = z.infer<typeof metadataSchema>;
