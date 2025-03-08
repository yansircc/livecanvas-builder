import { env } from "@/env";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamObject } from "ai";
import { PROMPT } from "./prompt";
import { codeSchema } from "./schema";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
	const body = await req.json();

	// Extract message, history, and optional API key and model from the request
	const { message, history, apiKey, model } = body;

	// Use provided API key or fall back to environment variable
	const openrouter = createOpenRouter({
		apiKey: apiKey || env.OPENROUTER_API_KEY,
	});

	// Use provided model or default to Claude 3.7 Sonnet
	const selectedModel = model || "openai/gpt-4o-mini";

	// Create a context-aware prompt that includes conversation history
	let contextualPrompt = PROMPT;

	// Add conversation history if available
	if (history && history.length > 0) {
		contextualPrompt += "\n\n### Previous Conversation Context:";
		history.forEach(
			(item: { prompt: string; response?: string }, index: number) => {
				contextualPrompt += `\n\nUser Request ${index + 1}: ${item.prompt}`;
				if (item.response) {
					contextualPrompt += `\n\nYour Response ${index + 1}: You generated the following HTML code:\n\`\`\`html\n${item.response}\n\`\`\``;
				}
			},
		);
		contextualPrompt += "\n\n### Current Request:";
	}

	// Add the current message
	contextualPrompt += `\n${message}`;

	// Stream the AI response as an object
	const result = streamObject({
		model: openrouter(selectedModel),
		schema: codeSchema,
		prompt: contextualPrompt,
	});

	return result.toTextStreamResponse();
}
