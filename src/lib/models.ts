"use server";

import { env } from "@/env";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createOpenAI } from "@ai-sdk/openai";
import { get, has } from "@vercel/edge-config";
import { createQwen } from "qwen-ai-provider";

export type AvailableProviderId =
	| "anthropic"
	| "openai"
	| "deepseek"
	| "qwen"
	| "google";

export type AvailableModelName =
	| "3.7 Sonnet"
	| "3.5 Sonnet"
	| "3.5 Haiku"
	| "4o"
	| "4o-mini"
	| "o1"
	| "o3-mini"
	| "2.0 flash"
	| "2.0 flash lite"
	| "R1"
	| "V3"
	| "V3-0324"
	| "32B"
	| "Max-0125";

export type AvailableModelId =
	| "claude-3-7-sonnet-20250219"
	| "claude-3-5-sonnet-20241022"
	| "claude-3-5-haiku-20241022"
	| "gpt-4o"
	| "gpt-4o-mini"
	| "o1"
	| "o3-mini"
	| "gemini-2.0-flash"
	| "gemini-2.0-flash-lite"
	| "deepseek-r1"
	| "deepseek-v3"
	| "deepseek-v3-0324"
	| "qwen-32b"
	| "qwen-max-0125";

interface Model {
	name: AvailableModelName;
	id: AvailableModelId;
	price: {
		input: number;
		output: number;
	};
	canOutputStructuredData: boolean;
}

export type ModelList = Record<AvailableProviderId, Model[]>;

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

const getModel = async (providerId: AvailableProviderId, modelId: string) => {
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
