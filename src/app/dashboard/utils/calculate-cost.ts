import type {
	AvailableModelId,
	AvailableProviderId,
	ModelList,
} from "@/lib/models";

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
	const exchangeRate = 7.3;
	const cost = {
		usd: (usage.totalTokens / 1000000) * price.input,
		cny: (usage.totalTokens / 1000000) * price.input * exchangeRate,
	};
	return cost;
}
