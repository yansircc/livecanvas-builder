import type { PollTaskResult, TaskRequest, TaskStatus } from "@/types/task";
import { useCallback, useMemo, useState } from "react";
import { useDialogueStore } from ".";
import {
	cancelTask as apiCancelTask,
	pollTaskStatus,
	submitChatTask,
} from "../actions/task-service";
import type { DialogueState } from "./dialogue-store/types";

export interface TaskPollingOptions {
	onTaskSubmitted?: (taskId: string) => void;
	onPollingStarted?: () => void;
	onPollingCompleted?: (result: PollTaskResult) => void;
	onError?: (error: Error) => void;
}

export interface TaskState {
	isLoading: boolean;
	error: string | null;
	status: TaskStatus | null;
}

export function useTaskPolling(options: TaskPollingOptions = {}) {
	const [taskId, setTaskId] = useState<string | null>(null);

	// Use stable selectors to prevent unnecessary re-renders
	const setSubmissionTaskStatus = useDialogueStore(
		useCallback((state: DialogueState) => state.setSubmissionTaskStatus, []),
	);

	const getDialogueSubmission = useDialogueStore(
		useCallback((state: DialogueState) => state.getDialogueSubmission, []),
	);

	const submitAndPollTask = useCallback(
		async (params: TaskRequest) => {
			try {
				// Submit the task
				const newTaskId = await submitChatTask(params);
				setTaskId(newTaskId);

				// 设置初始状态为 PENDING
				setSubmissionTaskStatus(
					params.dialogueId,
					params.submissionId,
					"PENDING",
				);

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
				setSubmissionTaskStatus(
					params.dialogueId,
					params.submissionId,
					result.status,
					result.error,
				);

				// Transform the result to match TaskResult interface
				const taskResult: PollTaskResult = {
					...result,
					taskId: newTaskId,
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
				setSubmissionTaskStatus(
					params.dialogueId,
					params.submissionId,
					"FAILED",
					errorObj.message,
				);

				if (options.onError) {
					options.onError(errorObj);
				}

				throw errorObj;
			}
		},
		[options, setSubmissionTaskStatus],
	);

	const cancelTask = useCallback(
		async (id: string, dialogueId: number, submissionId: number) => {
			try {
				const result = await apiCancelTask(id);
				if (result.success) {
					// 更新取消状态
					setSubmissionTaskStatus(
						dialogueId,
						submissionId,
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
		[setSubmissionTaskStatus],
	);

	// 获取特定dialogue的状态，使用memoize避免不必要的重新计算
	const getDialogueTaskState = useCallback(
		(dialogueId: number, submissionId: number): TaskState => {
			const submission = getDialogueSubmission(dialogueId, submissionId);
			return {
				isLoading: submission?.isLoading ?? false,
				error: submission?.taskError ?? null,
				status: submission?.taskStatus ?? null,
			};
		},
		[getDialogueSubmission],
	);

	// 返回稳定的对象引用，避免不必要的重新渲染
	return useMemo(
		() => ({
			getDialogueTaskState,
			taskId,
			submitAndPollTask,
			cancelTask,
		}),
		[getDialogueTaskState, taskId, submitAndPollTask, cancelTask],
	);
}
