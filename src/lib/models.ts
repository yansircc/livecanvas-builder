export const MODELS = [
	{
		id: "anthropic/claude-3-7-sonnet",
		name: "Claude 3.7 Sonnet",
	},
	{
		id: "openai/gpt-4o",
		name: "GPT-4o",
	},
	{
		id: "google/gemini-2.0-flash-001",
		name: "Gemini 2.0 Flash",
	},
] as const;

export type ModelId = (typeof MODELS)[number]["id"];
