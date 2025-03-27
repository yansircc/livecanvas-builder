import type {
	AvailableModelId,
	AvailableProviderId,
	ModelList,
} from "@/types/model";

const EXCHANGE_RATE = 7.3;

export function calculateCost(
	usage:
		| {
				totalTokens: number;
				promptTokens: number;
				completionTokens: number;
		  }
		| undefined,
	modelList: ModelList,
	providerId: AvailableProviderId,
	modelId: AvailableModelId,
) {
	if (!usage) return null;
	const price = modelList[providerId as AvailableProviderId]?.find(
		(model) => model.id === modelId,
	)?.price;
	if (!price) return null;
	const promptCost = (usage.totalTokens / 1000000) * price.input;
	const completionCost = (usage.completionTokens / 1000000) * price.output;
	const cost = {
		usd: promptCost + completionCost,
		cny: (promptCost + completionCost) * EXCHANGE_RATE,
	};
	return cost;
}

export function calculateExtraPromptCost(
	promptTokens: number,
	modelList: ModelList,
	providerId: AvailableProviderId,
	modelId: AvailableModelId,
) {
	const price = modelList[providerId as AvailableProviderId]?.find(
		(model) => model.id === modelId,
	)?.price;
	if (!price) return null;
	const cost = {
		usd: (promptTokens / 1000000) * price.input,
		cny: (promptTokens / 1000000) * price.input * EXCHANGE_RATE,
	};
	return cost;
}
