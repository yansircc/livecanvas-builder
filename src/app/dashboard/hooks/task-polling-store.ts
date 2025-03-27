import type { TaskParams, TaskResult } from "@/types/common";
import { useCallback, useState } from "react";
import {
	cancelTask as apiCancelTask,
	pollTaskStatus,
	submitChatTask,
} from "../actions/task-service";
import { useDialogueStore } from "./dialogue-store";

export interface TaskPollingOptions {
	onTaskSubmitted?: (taskId: string) => void;
	onPollingStarted?: () => void;
	onPollingCompleted?: (result: TaskResult) => void;
	onError?: (error: Error) => void;
}

export function useTaskPolling(options: TaskPollingOptions = {}) {
	const [taskId, setTaskId] = useState<string | null>(null);
	const { setVersionTaskStatus, getDialogueVersion } = useDialogueStore();

	const submitAndPollTask = useCallback(
		async (params: TaskParams) => {
			try {
				// Submit the task
				const newTaskId = await submitChatTask(params);
				setTaskId(newTaskId);

				// 设置初始状态为 PENDING
				setVersionTaskStatus(params.dialogueId, params.versionId, "PENDING");

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
					params.dialogueId,
					params.versionId,
					result.status,
					result.error,
				);

				// Transform the result to match TaskResult interface
				const taskResult: TaskResult = {
					taskId: newTaskId,
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
					params.dialogueId,
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
		async (id: string, dialogueId: number, versionId: number) => {
			try {
				const result = await apiCancelTask(id);
				if (result.success) {
					// 更新取消状态
					setVersionTaskStatus(
						dialogueId,
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

	// 获取特定dialogue的状态
	const getDialogueTaskState = useCallback(
		(dialogueId: number, versionId: number) => {
			const version = getDialogueVersion(dialogueId, versionId);
			return {
				isLoading: version?.isLoading ?? false,
				error: version?.taskError ?? null,
				status: version?.taskStatus ?? null,
			};
		},
		[getDialogueVersion],
	);

	return {
		getDialogueTaskState,
		taskId,
		submitAndPollTask,
		cancelTask,
	};
}
