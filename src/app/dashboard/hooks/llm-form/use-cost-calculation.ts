import type {
	AvailableModelId,
	AvailableProviderId,
	ModelList,
} from "@/lib/models";
import { useEffect, useState } from "react";

// temporary
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

	// Calculate extra prompt cost
	useEffect(() => {
		if (promptValue) {
			// In a real implementation, you'd use calculateExtraPromptCost
			// import { calculateExtraPromptCost } from "../../utils/calculate-cost";
			// const cost = calculateExtraPromptCost(promptValue);

			// This is just a placeholder for demonstration
			const cost: ExtraPromptCost = {
				tokens: 100000000,
				usd: 1,
				cny: 1 * 7.3,
			};
			setExtraPromptCost(cost);
		} else {
			setExtraPromptCost(null);
		}
	}, [promptValue]);

	return { extraPromptCost, currentModelPrice };
}
