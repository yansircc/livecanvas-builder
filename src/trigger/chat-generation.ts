import { codeSchema } from "@/app/api/chat/schema";
import type { CodeResponse } from "@/app/api/chat/schema";
import {
	LLM_LIST,
	canModelOutputStructuredData,
	parseModelId,
} from "@/lib/models";
import { logger, task } from "@trigger.dev/sdk/v3";
import { generateObject, generateText } from "ai";
import type { LanguageModel } from "ai";
import { z } from "zod";

// Define the input schema for the task
const chatInputSchema = z.object({
	processedPrompt: z.string(), // The fully processed prompt including context and history
	model: z.string(),
});

// Define the output type for the task
interface RawLLMResponse {
	// For structured data output (from generateObject)
	structuredOutput?: CodeResponse;
	// For text output (from generateText)
	textOutput?: string;
	// Flag to indicate if the response is structured or text
	isStructured: boolean;
	// Usage stats
	usage?: {
		promptTokens: number;
		completionTokens: number;
		totalTokens: number;
	};
}

export const chatGenerationTask = task({
	id: "chat-generation-task",
	maxDuration: 300,
	run: async (
		payload: z.infer<typeof chatInputSchema>,
	): Promise<RawLLMResponse> => {
		const { processedPrompt, model } = payload;

		// Parse the model ID to get provider and model value
		const { providerId, modelValue } = parseModelId(model);

		// Get the provider from LLM_LIST
		const provider = LLM_LIST[providerId];

		if (!provider) {
			throw new Error(`Provider ${providerId} not found`);
		}

		// Check if the selected model can output structured data
		const canOutputStructuredData = canModelOutputStructuredData(model);

		try {
			// Get raw response from LLM
			return await generateRawResponse(
				provider.model(modelValue),
				processedPrompt,
				canOutputStructuredData,
			);
		} catch (error) {
			logger.error("Generation failed", { error });
			throw error;
		}
	},
});

/**
 * Generate raw response from LLM without post-processing
 */
async function generateRawResponse(
	model: LanguageModel,
	prompt: string,
	canOutputStructuredData: boolean,
): Promise<RawLLMResponse> {
	if (canOutputStructuredData) {
		// Use generateObject for structured output
		const { object, usage } = await generateObject({
			model,
			schema: codeSchema,
			prompt,
		});

		logger.debug("Generated structured object", { object });

		return {
			structuredOutput: object,
			isStructured: true,
			usage: usage
				? {
						promptTokens: usage.promptTokens,
						completionTokens: usage.completionTokens,
						totalTokens: usage.totalTokens,
					}
				: undefined,
		};
	}

	// Use generateText for unstructured output
	const { text, usage } = await generateText({
		model,
		prompt: `${prompt}

Please respond with a valid JSON object containing 'code' and 'advices' fields. Format your response as a JSON object without any markdown formatting.`,
	});

	logger.info("Generated raw text", { text });

	return {
		textOutput: text,
		isStructured: false,
		usage: usage
			? {
					promptTokens: usage.promptTokens,
					completionTokens: usage.completionTokens,
					totalTokens: usage.totalTokens,
				}
			: undefined,
	};
}
