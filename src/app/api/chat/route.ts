import { streamObject } from "ai";
import { PROMPT } from "./prompt";
import { codeSchema } from "./schema";
import { LLM_LIST, parseModelId } from "@/lib/models";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
	const body = await req.json();

	// Extract message, context, history, and optional API key and model from the request
	const { message, context, history, apiKey, model } = body;

	// Default model if none provided
	const selectedModelId = model || "anthropic/claude-3-7-sonnet-20250219";
	
	// Parse the model ID to get provider and model value
	const { providerId, modelValue } = parseModelId(selectedModelId);
	
	// Get the provider from LLM_LIST
	const provider = LLM_LIST[providerId];
	
	if (!provider) {
		return new Response(
			JSON.stringify({ error: `Provider ${providerId} not found` }),
			{ status: 400 }
		);
	}

	// Create a context-aware prompt that includes conversation history
	let contextualPrompt = PROMPT;

	// Add user context if available
	if (context?.trim()) {
		contextualPrompt += `\n\n### User Context:\n${context}`;
	}

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
		model: provider.model(modelValue),
		schema: codeSchema,
		prompt: contextualPrompt,
	});

	return result.toTextStreamResponse();
}
