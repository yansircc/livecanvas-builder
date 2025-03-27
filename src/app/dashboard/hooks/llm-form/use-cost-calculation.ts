import type {
	AvailableModelId,
	AvailableProviderId,
	ModelList,
} from "@/types/model";
import { useEffect, useState } from "react";

// Constants
const EXCHANGE_RATE = 7.3;
const PRECISION_MODE_TOKENS = 13000;

// Interface for extra prompt cost
interface ExtraPromptCost {
	tokens: number;
	usd: number;
	cny: number;
}

export function useCostCalculation(
	promptValue: string,
	watchedProviderId: AvailableProviderId,
	watchedModelId: AvailableModelId,
	modelList: ModelList,
) {
	const [extraPromptCost, setExtraPromptCost] =
		useState<ExtraPromptCost | null>(null);

	// Get the current model's price info directly from modelList
	const currentModelPrice = modelList[watchedProviderId]?.find(
		(model) => model.id === watchedModelId,
	)?.price;

	// Calculate extra prompt cost based on the current model
	useEffect(() => {
		// Only calculate if we have a valid model price
		if (currentModelPrice) {
			// Calculate the cost for precision mode (13k tokens)
			// The price is per million tokens, so divide by 1,000,000
			const usdCost =
				(PRECISION_MODE_TOKENS * currentModelPrice.input) / 1000000;

			// Convert to CNY using the exchange rate
			const cnyCost = usdCost * EXCHANGE_RATE;

			const cost: ExtraPromptCost = {
				tokens: PRECISION_MODE_TOKENS,
				usd: usdCost,
				cny: cnyCost,
			};

			setExtraPromptCost(cost);
		} else {
			setExtraPromptCost(null);
		}
	}, [currentModelPrice]);

	return { extraPromptCost, currentModelPrice };
}
