export const MODELS = [
	{
		id: "anthropic/claude-3-7-sonnet",
		name: "Claude 3.7 Sonnet",
	},
	{
		id: "anthropic/claude-3-opus",
		name: "Claude 3 Opus",
	},
	{
		id: "anthropic/claude-3-5-sonnet",
		name: "Claude 3.5 Sonnet",
	},
	{
		id: "openai/gpt-4o",
		name: "GPT-4o",
	},
	{
		id: "openai/gpt-4o-mini",
		name: "GPT-4o Mini",
	},
] as const;

export type ModelId = (typeof MODELS)[number]["id"];
