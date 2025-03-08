import { z } from "zod";

export const codeSchema = z.object({
	code: z.string().describe("The HTML code"),
	advices: z.array(z.string()).describe("Some UI advices"),
});

export type CodeResponse = z.infer<typeof codeSchema>;
