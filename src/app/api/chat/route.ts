import openrouter from "@/utils/llm-provider";
import { streamObject } from "ai";
import { PROMPT } from "./prompt";
import { codeSchema } from "./schema";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
	const context = await req.json();

	const result = streamObject({
		model: openrouter("openai/gpt-4o-mini"),
		schema: codeSchema,
		prompt: PROMPT,
	});

	return result.toTextStreamResponse();
}
