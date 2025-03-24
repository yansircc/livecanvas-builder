import type { ChatTaskResponse, TaskStatusResponse } from "@/types/task";
import type { TokenUsage } from "../hooks/llm-session-store";

/**
 * Submit a chat task to the API
 */
export async function submitChatTask(params: {
	prompt: string;
	history?: { prompt: string; response?: string }[];
	modelId?: string;
	withBackgroundInfo?: boolean;
	precisionMode?: boolean;
}): Promise<string> {
	const response = await fetch("/api/chat", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(params),
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(
			`Failed to submit task: ${response.status} ${response.statusText}${
				errorData.error ? ` - ${errorData.error}` : ""
			}`,
		);
	}

	const data = (await response.json()) as ChatTaskResponse;

	if (!data.taskId) {
		throw new Error("No task ID returned from the server");
	}

	return data.taskId;
}

/**
 * Poll for task status until completion or error
 */
export async function pollTaskStatus(
	taskId: string,
	intervalMs = 3000,
	maxAttempts = 100,
): Promise<{
	code: string;
	advices: string[];
	usage?: TokenUsage;
}> {
	let attempts = 0;

	// Create a promise that resolves with the task result or rejects with an error
	return new Promise((resolve, reject) => {
		const poll = async () => {
			if (attempts >= maxAttempts) {
				reject(new Error("Max polling attempts reached"));
				return;
			}

			attempts++;

			try {
				const response = await fetch(`/api/task-status?taskId=${taskId}`, {
					headers: {
						"Cache-Control": "no-cache",
					},
				});

				if (!response.ok) {
					if (response.status === 404) {
						// Task not found, wait and retry
						setTimeout(poll, intervalMs);
						return;
					}

					const errorData = await response.json().catch(() => ({}));
					throw new Error(
						`API error: ${response.status} ${response.statusText}${
							errorData.error ? ` - ${errorData.error}` : ""
						}`,
					);
				}

				const data = (await response.json()) as TaskStatusResponse;

				// Check task status
				if (data.status === "processing") {
					// Still processing, continue polling
					setTimeout(poll, intervalMs);
					return;
				}

				if (data.status === "error") {
					// Task failed
					reject(
						new Error(
							`Task failed: ${
								typeof data.error === "string"
									? data.error
									: JSON.stringify(data.error)
							}`,
						),
					);
					return;
				}

				if (data.status === "completed") {
					// Task completed, check output
					if (!data.output) {
						reject(new Error("Task completed but no output received"));
						return;
					}

					const output = data.output as {
						code: string;
						advices: string[];
						usage?: {
							promptTokens: number;
							completionTokens: number;
							totalTokens: number;
						};
					};

					// Return the result
					resolve({
						code: output.code,
						advices: output.advices || [],
						usage: output.usage
							? {
									promptTokens: output.usage.promptTokens,
									completionTokens: output.usage.completionTokens,
									totalTokens: output.usage.totalTokens,
								}
							: undefined,
					});
					return;
				}

				// Unexpected status, retry
				setTimeout(poll, intervalMs);
			} catch (error) {
				// Network error or other unexpected error, retry
				console.error("Error polling task status:", error);
				setTimeout(poll, intervalMs);
			}
		};

		// Start polling
		poll();
	});
}
