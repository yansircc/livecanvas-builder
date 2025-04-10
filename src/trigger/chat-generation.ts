import { codeSchema } from "@/app/api/task/submit/schema";
import type { CodeResponse } from "@/app/api/task/submit/schema";
import { canModelOutputStructuredData, getModel } from "@/lib/models";
import type { AvailableModelId, AvailableProviderId } from "@/types/model";
import { logger, task } from "@trigger.dev/sdk/v3";
import { generateObject, generateText } from "ai";
import type { LanguageModel } from "ai";

interface ChatInput {
	processedPrompt: string;
	providerId: AvailableProviderId;
	modelId: AvailableModelId;
	apiKey: string;
}

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
	run: async (payload: ChatInput): Promise<RawLLMResponse> => {
		const { processedPrompt, providerId, modelId, apiKey } = payload;

		try {
			// Get the model instance, passing the user's API key
			const model = await getModel(providerId, modelId, apiKey);

			if (!model) {
				throw new Error("Model not found or API key invalid");
			}

			// Check if the model can output structured data
			const canOutputStructured = await canModelOutputStructuredData(
				providerId,
				modelId,
			);

			// Get raw response from LLM
			return await generateRawResponse(
				model,
				processedPrompt,
				canOutputStructured ?? false, // Default to false if undefined
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
		prompt,
	});

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
