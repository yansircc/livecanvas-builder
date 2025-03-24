import type { TokenUsage } from "../../hooks/llm-session-store";

export interface ResponseData {
	code?: string;
	advices?: string[];
	usage?: TokenUsage;
	[key: string]: unknown;
}

export interface CalculatedCost {
	inputCost: number;
	outputCost: number;
	totalCost: number;
}
