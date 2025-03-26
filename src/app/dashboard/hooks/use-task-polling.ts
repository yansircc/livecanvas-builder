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
import { useLlmSessionStore } from "./llm-session-store";

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

interface TaskParams {
	prompt: string;
	history?: { prompt: string; response?: string }[];
	providerId?: AvailableProviderId;
	modelId?: AvailableModelId;
	withBackgroundInfo?: boolean;
	precisionMode?: boolean;
	sessionId: number;
	versionId: number;
}

export function useTaskPolling(options: TaskPollingOptions = {}) {
	const [taskId, setTaskId] = useState<string | null>(null);
	const { setVersionTaskStatus, getSessionVersion } = useLlmSessionStore();

	const submitAndPollTask = useCallback(
		async (params: TaskParams) => {
			try {
				// Submit the task
				const newTaskId = await submitChatTask(params);
				setTaskId(newTaskId);

				// 设置初始状态为 PENDING
				setVersionTaskStatus(params.sessionId, params.versionId, "PENDING");

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

				// 更新任务状态
				setVersionTaskStatus(
					params.sessionId,
					params.versionId,
					result.status,
					result.error,
				);

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

				// 更新错误状态
				setVersionTaskStatus(
					params.sessionId,
					params.versionId,
					"FAILED",
					errorObj.message,
				);

				if (options.onError) {
					options.onError(errorObj);
				}

				throw errorObj;
			}
		},
		[options, setVersionTaskStatus],
	);

	const cancelTask = useCallback(
		async (id: string, sessionId: number, versionId: number) => {
			try {
				const result = await apiCancelTask(id);
				if (result.success) {
					// 更新取消状态
					setVersionTaskStatus(
						sessionId,
						versionId,
						"CANCELED",
						"任务已被取消",
					);
					return true;
				}
				return false;
			} catch (err) {
				console.error("Error canceling task:", err);
				return false;
			}
		},
		[setVersionTaskStatus],
	);

	// 获取特定session的状态
	const getSessionTaskState = useCallback(
		(sessionId: number, versionId: number) => {
			const version = getSessionVersion(sessionId, versionId);
			return {
				isLoading: version?.isLoading ?? false,
				error: version?.taskError ?? null,
				status: version?.taskStatus ?? null,
			};
		},
		[getSessionVersion],
	);

	return {
		getSessionTaskState,
		taskId,
		submitAndPollTask,
		cancelTask,
	};
}
