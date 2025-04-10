"use server";

import { env } from "@/env";
import type {
	AvailableModelId,
	AvailableProviderId,
	ModelList,
} from "@/types/model";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { get, has } from "@vercel/edge-config";
import type { LanguageModelV1 } from "ai";
import { createQwen } from "qwen-ai-provider";

const OPENROUTER_CONFIG = {
	apiKey: env.OPENROUTER_API_KEY,
	// baseURL: "https://openrouter.ai/api/v1",
};

const getModelList = async () => {
	try {
		const modelList = (await get("modelList")) as ModelList;
		// Validate the model list structure
		if (!modelList || typeof modelList !== "object") {
			throw new Error("Invalid model list format");
		}

		// Ensure all required providers exist
		const providers: AvailableProviderId[] = [
			"anthropic",
			"openai",
			"deepseek",
			"qwen",
			"google",
		];
		for (const provider of providers) {
			if (!Array.isArray(modelList[provider])) {
				modelList[provider] = [];
			}
		}

		return modelList;
	} catch (error) {
		console.error("Failed to get model list:", error);
		// Return a default empty model list
		return {
			anthropic: [],
			openai: [],
			deepseek: [],
			qwen: [],
			google: [],
		} as ModelList;
	}
};

const getModel = async (
	providerId: AvailableProviderId,
	modelId: AvailableModelId,
	apiKey: string,
) => {
	// Create a dynamic config object
	const config = {
		apiKey,
		baseURL: "https://aihubmix.com/v1",
	};

	// Ensure an API key is available
	if (!config.apiKey) {
		console.error(
			"API key is missing. Provide it either via user settings or environment variable.",
		);
		// Optionally throw an error or return a specific status
		// throw new Error("API key is required.");
		return null; // Or handle as appropriate
	}

	try {
		switch (providerId) {
			case "anthropic": {
				const anthropic = createAnthropic(config); // Use dynamic config
				return anthropic(modelId) as LanguageModelV1;
			}
			case "openai": {
				const openai = createOpenAI(config); // Use dynamic config
				const quasar = createOpenRouter(OPENROUTER_CONFIG);
				if (modelId === "openrouter/quasar-alpha") {
					return quasar(modelId) as LanguageModelV1;
				}
				return openai(modelId) as LanguageModelV1;
			}
			case "deepseek": {
				const deepseek = createDeepSeek(config); // Use dynamic config
				return deepseek(modelId) as LanguageModelV1;
			}
			case "qwen": {
				const qwen = createQwen(config); // Use dynamic config
				return qwen(modelId) as LanguageModelV1;
			}
			case "google": {
				const google = createOpenAI(config); // Use dynamic config
				return google(modelId) as LanguageModelV1;
			}
			default: {
				throw new Error(`Unknown provider: ${providerId}`);
			}
		}
	} catch (error) {
		console.error(`Failed to get model for ${providerId}/${modelId}:`, error);
		return null;
	}
};

const hasModelList = async () => {
	try {
		return await has("modelList");
	} catch (error) {
		console.error("Failed to check model list existence:", error);
		return false;
	}
};

const isValidModel = async (
	providerId: AvailableProviderId,
	modelId: AvailableModelId,
) => {
	try {
		const modelList = await getModelList();
		const providerModels = modelList[providerId];
		if (!Array.isArray(providerModels)) {
			return false;
		}
		return providerModels.some((model) => model.id === modelId);
	} catch (error) {
		console.error("Failed to validate model:", error);
		return false;
	}
};

const canModelOutputStructuredData = async (
	providerId: AvailableProviderId,
	modelId: AvailableModelId,
) => {
	try {
		const modelList = await getModelList();
		const providerModels = modelList[providerId];
		if (!Array.isArray(providerModels)) {
			return false;
		}
		return (
			providerModels.find((model) => model.id === modelId)
				?.canOutputStructuredData || false
		);
	} catch (error) {
		console.error("Failed to check model capability:", error);
		return false;
	}
};

export {
	getModelList,
	getModel,
	hasModelList,
	isValidModel,
	canModelOutputStructuredData,
};
