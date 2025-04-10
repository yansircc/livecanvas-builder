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
	| "Quasar"
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
	| "openrouter/quasar-alpha"
	| "gemini-2.0-flash"
	| "gemini-2.0-flash-lite"
	| "deepseek-r1"
	| "deepseek-v3"
	| "deepseek-v3-0324"
	| "qwen-32b"
	| "qwen-max-0125";

export interface Model {
	name: AvailableModelName;
	id: AvailableModelId;
	price: {
		input: number;
		output: number;
	};
	canOutputStructuredData: boolean;
}

export type ModelList = Record<AvailableProviderId, Model[]>;
