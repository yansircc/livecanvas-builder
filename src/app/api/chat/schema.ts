import { z } from "zod";

export const codeSchema = z.object({
	code: z.string().describe("The ejs code"),
	advices: z.array(z.string()).describe("Some UI advices"),
});
