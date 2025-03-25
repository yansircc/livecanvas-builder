import { tryCatch } from "@/lib/try-catch";
import type { ChatTaskResponse } from "@/types/chat";
import type { TaskStatusResponse } from "@/types/task";
import { extractAndParseJSON } from "@/utils/json-parser";
import { replaceLucideIcons } from "@/utils/replace-with-lucide-icon";
import { replaceWithUnsplashImages } from "@/utils/replace-with-unsplash";
import type { TokenUsage } from "../hooks/llm-session-store";

interface ChatTaskParams {
	prompt: string;
	history?: { prompt: string; response?: string }[];
	modelId?: string;
	withBackgroundInfo?: boolean;
	precisionMode?: boolean;
}

interface RawLLMResponse {
	structuredOutput?: ChatTaskResponse;
	textOutput?: string;
	isStructured: boolean;
	usage?: {
		promptTokens: number;
		completionTokens: number;
		totalTokens: number;
	};
}

interface ProcessedLLMResponse {
	code: string;
	advices: string[];
	usage?: TokenUsage;
}

/**
 * Submit a chat task to the API
 */
export async function submitChatTask(params: ChatTaskParams): Promise<string> {
	const result = await tryCatch(
		fetch("/api/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(params),
		}),
	);

	if (result.error) {
		throw new Error(`Failed to submit task: ${result.error.message}`);
	}

	if (!result.data.ok) {
		const errorData = await result.data.json().catch(() => ({}));
		throw new Error(
			`Failed to submit task: ${result.data.status} ${result.data.statusText}${
				errorData.error ? ` - ${errorData.error}` : ""
			}`,
		);
	}

	const data = (await result.data.json()) as ChatTaskResponse;

	if (!data.taskId) {
		throw new Error("No task ID returned from the server");
	}

	return data.taskId;
}

/**
 * Process the raw LLM response into a standardized format
 */
async function processLLMResponse(
	rawResponse: RawLLMResponse,
): Promise<ProcessedLLMResponse> {
	if (rawResponse.isStructured && rawResponse.structuredOutput) {
		const { code, advices, usage } = rawResponse.structuredOutput;
		return {
			code: code
				? replaceWithUnsplashImages(replaceLucideIcons(code))
				: "<!-- No code generated -->",
			advices: advices || [],
			usage,
		};
	}

	if (!rawResponse.isStructured && rawResponse.textOutput) {
		const parsedResult = await tryCatch(
			Promise.resolve(
				extractAndParseJSON<ChatTaskResponse>(rawResponse.textOutput),
			),
		);

		if (parsedResult.error || !parsedResult.data?.code) {
			return {
				code: "<!-- Error: Failed to parse LLM response -->",
				advices: ["There was an error processing the LLM response"],
				usage: rawResponse.usage,
			};
		}

		return {
			code: replaceWithUnsplashImages(
				replaceLucideIcons(parsedResult.data.code),
			),
			advices: parsedResult.data.advices || [],
			usage: rawResponse.usage,
		};
	}

	return {
		code: "<!-- Error: Invalid LLM response format -->",
		advices: ["Invalid LLM response format"],
		usage: rawResponse.usage,
	};
}

/**
 * Poll for task status until completion or error
 */
export async function pollTaskStatus(
	taskId: string,
	intervalMs = 3000,
	maxAttempts = 100,
): Promise<ProcessedLLMResponse> {
	let attempts = 0;

	const pollOnce = async (): Promise<ProcessedLLMResponse> => {
		if (attempts >= maxAttempts) {
			throw new Error("Max polling attempts reached");
		}

		attempts++;

		const result = await tryCatch(
			fetch(`/api/task-status?taskId=${taskId}`, {
				headers: { "Cache-Control": "no-cache" },
			}),
		);

		if (result.error) {
			throw new Error(`Network error while polling: ${result.error.message}`);
		}

		if (!result.data.ok) {
			if (result.data.status === 404) {
				// Task not found, continue polling
				await new Promise((resolve) => setTimeout(resolve, intervalMs));
				return pollOnce();
			}

			const errorData = await result.data.json().catch(() => ({}));
			throw new Error(
				`API error: ${result.data.status} ${result.data.statusText}${
					errorData.error ? ` - ${errorData.error}` : ""
				}`,
			);
		}

		const data = (await result.data.json()) as TaskStatusResponse;

		switch (data.status) {
			case "processing":
				await new Promise((resolve) => setTimeout(resolve, intervalMs));
				return pollOnce();

			case "error":
				throw new Error(
					`Task failed: ${
						typeof data.error === "string"
							? data.error
							: JSON.stringify(data.error)
					}`,
				);

			case "completed": {
				if (!data.output) {
					throw new Error("Task completed but no output received");
				}

				const rawOutput: RawLLMResponse =
					typeof data.output === "string"
						? JSON.parse(data.output)
						: (data.output as RawLLMResponse);

				return processLLMResponse(rawOutput);
			}

			default:
				await new Promise((resolve) => setTimeout(resolve, intervalMs));
				return pollOnce();
		}
	};

	return pollOnce();
}
