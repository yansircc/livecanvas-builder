"use client";

import type { AvailableModelId, AvailableProviderId } from "@/lib/models";
import type { TaskStatus } from "@/types/task";
import { useCallback, useState } from "react";
import {
	cancelTask as apiCancelTask,
	pollTaskStatus,
	submitChatTask,
} from "../services/task-service";
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
	status: TaskStatus;
	error?: string;
}

export function useTaskPolling(options: TaskPollingOptions = {}) {
	const [isLoading, setIsLoading] = useState(false);
	const [taskId, setTaskId] = useState<string | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [currentStatus, setCurrentStatus] = useState<TaskStatus | null>(null);

	const submitAndPollTask = useCallback(
		async (params: {
			prompt: string;
			history?: { prompt: string; response?: string }[];
			providerId?: AvailableProviderId;
			modelId?: AvailableModelId;
			withBackgroundInfo?: boolean;
			precisionMode?: boolean;
		}) => {
			try {
				setIsLoading(true);
				setError(null);
				setCurrentStatus(null);

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

				// Update current status
				setCurrentStatus(result.status);

				// Transform the result to match TaskResult interface
				const taskResult: TaskResult = {
					...result.response,
					status: result.status,
					error: result.error,
				};

				// Notify that polling completed with result
				if (options.onPollingCompleted) {
					options.onPollingCompleted(taskResult);
				}

				return taskResult;
			} catch (err) {
				const errorObj = err instanceof Error ? err : new Error(String(err));
				console.error("Task polling error:", errorObj.message);
				setError(errorObj);

				// 设置错误状态
				if (errorObj.message.includes("取消")) {
					setCurrentStatus("CANCELED");
				} else {
					setCurrentStatus("FAILED");
				}

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

	const cancelTask = useCallback(async (id: string) => {
		try {
			const result = await apiCancelTask(id);
			if (result.success) {
				setCurrentStatus("CANCELED");
				return true;
			}
			return false;
		} catch (err) {
			console.error("Error canceling task:", err);
			return false;
		}
	}, []);

	return {
		isLoading,
		taskId,
		error,
		status: currentStatus,
		submitAndPollTask,
		cancelTask,
	};
}
