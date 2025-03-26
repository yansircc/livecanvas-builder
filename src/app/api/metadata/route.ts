import { getModel, isValidModel } from "@/lib/models";
import { generateObject } from "ai";
import { PROMPT } from "./prompt";
import { metadataSchema } from "./schema";

// Allow streaming responses up to 15 seconds
export const maxDuration = 15;

interface MetadataRequestBody {
	htmlContent: string;
	regenerate?: boolean;
}

export async function POST(req: Request) {
	try {
		const body = (await req.json()) as MetadataRequestBody;

		// Extract HTML content and regenerate flag from the request
		const { htmlContent, regenerate = false } = body;

		if (!htmlContent || typeof htmlContent !== "string") {
			return new Response(
				JSON.stringify({ error: "HTML content is required" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Use GPT-4o Mini as the fixed model
		const provider = "openai" as const;
		const modelId = "gpt-4o";

		// Validate the model
		const isValid = await isValidModel(provider, modelId);
		if (!isValid) {
			return new Response(
				JSON.stringify({ error: "Invalid model configuration" }),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Create the model instance
		const model = await getModel(provider, modelId);

		if (!model) {
			return new Response(
				JSON.stringify({ error: "Failed to create model instance" }),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Prepare the system prompt and user message
		const systemPrompt = PROMPT;
		let userMessage = `Please analyze this HTML content and generate appropriate metadata (title, description, and tags in Chinese):

\`\`\`html
${htmlContent}
\`\`\``;

		// If regenerate flag is true, ask for different results
		if (regenerate) {
			userMessage +=
				"\n\nPlease provide different metadata than before, with a new perspective or focus.";
		}

		try {
			// Generate structured output using the model
			const result = await generateObject({
				model,
				schema: metadataSchema,
				system: systemPrompt,
				messages: [{ role: "user", content: userMessage }],
			});

			return new Response(JSON.stringify(result.object), {
				headers: { "Content-Type": "application/json" },
			});
		} catch (error) {
			console.error("Error generating structured output:", error);
			return new Response(
				JSON.stringify({
					error: "Failed to generate metadata",
					details: error instanceof Error ? error.message : String(error),
				}),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}
	} catch (error) {
		console.error("Request processing error:", error);
		return new Response(
			JSON.stringify({
				error: "Failed to process request",
				details: error instanceof Error ? error.message : String(error),
			}),
			{
				status: 400,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
