"use server";

import { env } from "@/env";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createOpenAI } from "@ai-sdk/openai";
import { get, has } from "@vercel/edge-config";
import { createQwen } from "qwen-ai-provider";

export type ModelProvider =
	| "anthropic"
	| "openai"
	| "deepseek"
	| "qwen"
	| "google";

interface Model {
	name: string;
	value: string;
	price: {
		input: number;
		output: number;
	};
	canOutputStructuredData: boolean;
}

export type ModelList = Record<ModelProvider, Model[]>;

const AHM_CONFIG = {
	apiKey: env.AI_HUB_MIX_API_KEY,
	baseURL: "https://aihubmix.com/v1",
};

const getModelList = async () => {
	try {
		const modelList = (await get("modelList")) as ModelList;
		// Validate the model list structure
		if (!modelList || typeof modelList !== "object") {
			throw new Error("Invalid model list format");
		}

		// Ensure all required providers exist
		const providers: ModelProvider[] = [
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

const getModel = async (providerId: ModelProvider, modelId: string) => {
	try {
		switch (providerId) {
			case "anthropic": {
				const anthropic = createAnthropic(AHM_CONFIG);
				return anthropic(modelId);
			}
			case "openai": {
				const openai = createOpenAI(AHM_CONFIG);
				return openai(modelId);
			}
			case "deepseek": {
				const deepseek = createDeepSeek(AHM_CONFIG);
				return deepseek(modelId);
			}
			case "qwen": {
				const qwen = createQwen(AHM_CONFIG);
				return qwen(modelId);
			}
			case "google": {
				const google = createOpenAI(AHM_CONFIG);
				return google(modelId);
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

const isValidModel = async (providerId: ModelProvider, modelId: string) => {
	try {
		const modelList = await getModelList();
		const providerModels = modelList[providerId];
		if (!Array.isArray(providerModels)) {
			return false;
		}
		return providerModels.some((model) => model.value === modelId);
	} catch (error) {
		console.error("Failed to validate model:", error);
		return false;
	}
};

const canModelOutputStructuredData = async (
	providerId: ModelProvider,
	modelId: string,
) => {
	try {
		const modelList = await getModelList();
		const providerModels = modelList[providerId];
		if (!Array.isArray(providerModels)) {
			return false;
		}
		return (
			providerModels.find((model) => model.value === modelId)
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
