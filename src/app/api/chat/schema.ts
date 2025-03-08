import { z } from "zod";

export const codeSchema = z.object({
	code: z.string().describe("The HTML code, the copy should be English"),
	advices: z.array(
		z
			.string()
			.describe("Concise and unique advice, within 10 Chinese characters"),
	),
});

export type CodeResponse = z.infer<typeof codeSchema>;
