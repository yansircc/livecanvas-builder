import { env } from "@/env";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamObject } from "ai";
import { PROMPT } from "./prompt";
import { codeSchema } from "./schema";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
	const body = await req.json();

	// Extract message and optional API key and model from the request
	const { message, apiKey, model } = body;

	// Use provided API key or fall back to environment variable
	const openrouter = createOpenRouter({
		apiKey: apiKey || env.OPENROUTER_API_KEY,
	});

	// Use provided model or default to Claude 3.7 Sonnet
	const selectedModel = model || "openai/gpt-4o-mini";

	// Stream the AI response as an object
	const result = streamObject({
		model: openrouter(selectedModel),
		schema: codeSchema,
		prompt: PROMPT + message,
	});

	return result.toTextStreamResponse();
}
