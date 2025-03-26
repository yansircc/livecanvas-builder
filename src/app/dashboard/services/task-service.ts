import type { AvailableModelId, AvailableProviderId } from "@/lib/models";
import { tryCatch } from "@/lib/try-catch";
import type { ChatTaskResponse } from "@/types/chat";
import type { TaskStatus, TaskStatusResponse } from "@/types/task";
import { extractAndParseJSON } from "@/utils/json-parser";
import { replaceLucideIcons } from "@/utils/replace-with-lucide-icon";
import { replaceWithUnsplashImages } from "@/utils/replace-with-unsplash";
import type { TokenUsage } from "../hooks/llm-session-store";

interface ChatTaskParams {
	prompt: string;
	history?: { prompt: string; response?: string }[];
	providerId?: AvailableProviderId;
	modelId?: AvailableModelId;
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

interface PollTaskResult {
	response: ProcessedLLMResponse;
	status: TaskStatus;
	error?: string;
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
	// Capture the usage data at the top level to ensure it's always available
	const usage = rawResponse.usage;

	if (rawResponse.isStructured && rawResponse.structuredOutput) {
		const { code, advices } = rawResponse.structuredOutput;
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
				usage,
			};
		}

		return {
			code: replaceWithUnsplashImages(
				replaceLucideIcons(parsedResult.data.code),
			),
			advices: parsedResult.data.advices || [],
			usage,
		};
	}

	return {
		code: "<!-- Error: Invalid LLM response format -->",
		advices: ["Invalid LLM response format"],
		usage,
	};
}

/**
 * Poll for task status until completion or error
 */
export async function pollTaskStatus(
	taskId: string,
	intervalMs = 3000,
	maxAttempts = 100,
): Promise<PollTaskResult> {
	let attempts = 0;

	const pollOnce = async (): Promise<PollTaskResult> => {
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

		// 根据任务状态处理响应
		switch (data.status) {
			// 处理中的状态 - 继续轮询
			case "PENDING":
			case "WAITING":
			case "RUNNING":
			case "EXECUTING":
				await new Promise((resolve) => setTimeout(resolve, intervalMs));
				return pollOnce();

			// 错误状态 - 返回错误信息
			case "FAILED":
			case "CRASHED":
			case "SYSTEM_FAILURE":
			case "INTERRUPTED":
				return {
					response: {
						code: `<!-- Error: Task ${data.status.toLowerCase()} -->`,
						advices: [`Task ${data.status.toLowerCase()}`],
					},
					status: data.status,
					error:
						typeof data.error === "string"
							? data.error
							: JSON.stringify(data.error),
				};

			// 取消状态 - 返回取消信息
			case "CANCELED":
				return {
					response: {
						code: "<!-- Task was canceled -->",
						advices: ["The task was canceled"],
					},
					status: "CANCELED",
					error: "任务已被取消",
				};

			// 完成状态 - 处理并返回结果
			case "COMPLETED": {
				if (!data.output) {
					throw new Error("Task completed but no output received");
				}

				const rawOutput: RawLLMResponse =
					typeof data.output === "string"
						? JSON.parse(data.output)
						: (data.output as RawLLMResponse);

				return {
					response: await processLLMResponse(rawOutput),
					status: "COMPLETED",
				};
			}

			// 其他未知状态 - 继续轮询
			default:
				await new Promise((resolve) => setTimeout(resolve, intervalMs));
				return pollOnce();
		}
	};

	return pollOnce();
}
