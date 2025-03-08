import { z } from "zod";

// define a schema for the notifications
export const notificationSchema = z.object({
	notifications: z.array(
		z.object({
			code: z.string().describe("The ejs code"),
			advices: z
				.array(z.string())
				.nullable()
				.describe("The advices to improve the UI"),
		}),
	),
});
