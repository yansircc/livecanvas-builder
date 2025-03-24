"use client";

import { useCallback, useState } from "react";
import { pollTaskStatus, submitChatTask } from "../services/task-service";
import type { TokenUsage } from "./llm-session-store";

interface TaskPollingOptions {
	onTaskSubmitted?: (taskId: string) => void;
	onPollingStarted?: () => void;
	onPollingCompleted?: (result: TaskResult) => void;
	onError?: (error: Error) => void;
}

export interface TaskResult {
	code: string;
	advices: string[];
	usage?: TokenUsage;
}

export function useTaskPolling(options: TaskPollingOptions = {}) {
	const [isLoading, setIsLoading] = useState(false);
	const [taskId, setTaskId] = useState<string | null>(null);
	const [error, setError] = useState<Error | null>(null);

	const submitAndPollTask = useCallback(
		async (params: {
			prompt: string;
			history?: { prompt: string; response?: string }[];
			modelId?: string;
			withBackgroundInfo?: boolean;
			precisionMode?: boolean;
		}) => {
			try {
				setIsLoading(true);
				setError(null);

				// Submit the task
				const newTaskId = await submitChatTask(params);
				setTaskId(newTaskId);

				// Notify that task was submitted
				if (options.onTaskSubmitted) {
					options.onTaskSubmitted(newTaskId);
				}

				// Notify that polling started
				if (options.onPollingStarted) {
					options.onPollingStarted();
				}

				// Start polling for results
				const result = await pollTaskStatus(newTaskId);

				// Notify that polling completed with result
				if (options.onPollingCompleted) {
					options.onPollingCompleted(result);
				}

				return result;
			} catch (err) {
				const errorObj = err instanceof Error ? err : new Error(String(err));
				setError(errorObj);

				if (options.onError) {
					options.onError(errorObj);
				}

				throw errorObj;
			} finally {
				setIsLoading(false);
			}
		},
		[options],
	);

	return {
		isLoading,
		taskId,
		error,
		submitAndPollTask,
	};
}
