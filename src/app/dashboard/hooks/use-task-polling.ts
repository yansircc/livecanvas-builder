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
	const [taskStates, setTaskStates] = useState<
		Map<
			string,
			{
				isLoading: boolean;
				error: Error | null;
				status: TaskStatus | null;
			}
		>
	>(new Map());
	const [taskId, setTaskId] = useState<string | null>(null);

	const submitAndPollTask = useCallback(
		async (params: {
			prompt: string;
			history?: { prompt: string; response?: string }[];
			providerId?: AvailableProviderId;
			modelId?: AvailableModelId;
			withBackgroundInfo?: boolean;
			precisionMode?: boolean;
			sessionId: number;
		}) => {
			try {
				// 为新的任务创建状态
				setTaskStates((prev) => {
					const newMap = new Map(prev);
					newMap.set(String(params.sessionId), {
						isLoading: true,
						error: null,
						status: null,
					});
					return newMap;
				});

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

				// Update task state
				setTaskStates((prev) => {
					const newMap = new Map(prev);
					newMap.set(String(params.sessionId), {
						isLoading: false,
						error: null,
						status: result.status,
					});
					return newMap;
				});

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

				// Update error state for the specific session
				setTaskStates((prev) => {
					const newMap = new Map(prev);
					newMap.set(String(params.sessionId), {
						isLoading: false,
						error: errorObj,
						status: errorObj.message.includes("取消") ? "CANCELED" : "FAILED",
					});
					return newMap;
				});

				if (options.onError) {
					options.onError(errorObj);
				}

				throw errorObj;
			}
		},
		[options],
	);

	const cancelTask = useCallback(async (id: string, sessionId: number) => {
		try {
			const result = await apiCancelTask(id);
			if (result.success) {
				setTaskStates((prev) => {
					const newMap = new Map(prev);
					newMap.set(String(sessionId), {
						isLoading: false,
						error: null,
						status: "CANCELED",
					});
					return newMap;
				});
				return true;
			}
			return false;
		} catch (err) {
			console.error("Error canceling task:", err);
			return false;
		}
	}, []);

	// 获取特定session的状态
	const getSessionTaskState = useCallback(
		(sessionId: number) => {
			return (
				taskStates.get(String(sessionId)) || {
					isLoading: false,
					error: null,
					status: null,
				}
			);
		},
		[taskStates],
	);

	return {
		getSessionTaskState,
		taskId,
		submitAndPollTask,
		cancelTask,
	};
}
