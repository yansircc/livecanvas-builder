import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ModelList, ModelProvider } from "@/lib/models";
import { Info } from "lucide-react";

interface ShowCostProps {
	usage:
		| {
				totalTokens: number;
				promptTokens: number;
				completionTokens: number;
		  }
		| undefined;
	providerId: string;
	modelId: string;
	modelList: ModelList;
}

export default function ShowCost({
	usage,
	providerId,
	modelId,
	modelList,
}: ShowCostProps) {
	if (!usage) return null;
	const price = modelList[providerId as ModelProvider]?.find(
		(model) => model.value === modelId,
	)?.price;
	if (!price) return null;
	const exchangeRate = 7.3;
	const cost = {
		usd: (usage.totalTokens / 1000000) * price.input,
		cny: (usage.totalTokens / 1000000) * price.input * exchangeRate,
	};
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex cursor-help items-center gap-1 rounded-lg bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
						<Info className="h-3 w-3" />
						<span>{cost?.cny.toFixed(2)} 元</span>
					</div>
				</TooltipTrigger>
				<TooltipContent className="space-y-1 text-xs">
					<p>总计: {usage?.totalTokens.toLocaleString()} tokens</p>
					<p>提示: {usage?.promptTokens.toLocaleString()} tokens</p>
					<p>补全: {usage?.completionTokens.toLocaleString()} tokens</p>
					<p className="pt-1 font-medium text-xs">
						费用: {cost?.cny.toFixed(4)} 元 (${cost?.usd.toFixed(4)})
					</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
