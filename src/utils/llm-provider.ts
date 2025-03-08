import { env } from "@/env";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
	apiKey: env.OPENROUTER_API_KEY,
});

export default openrouter;
