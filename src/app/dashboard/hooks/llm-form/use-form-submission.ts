import type { Dialogue } from "@/types/common";
import type {
	DialogueHistory,
	PollTaskResult,
	TaskRequest,
} from "@/types/task";
import { useCallback } from "react";
import type { FormValues } from "./schema";

export interface UseFormSubmissionProps {
	activeDialogueId: number;
	getPreviousDialogue: (dialogueId: number) => DialogueHistory | null;
	addSubmission: (dialogueId: number, input: TaskRequest) => number;
	submitAndPollTask: (params: TaskRequest) => Promise<PollTaskResult>;
	setSubmissionResponse: (
		dialogueId: number,
		submissionId: number,
		response: PollTaskResult,
	) => void;
	markDialogueCompleted: (dialogueId: number) => void;
	resetSubmissionLoadingState: () => void;
	activeDialogue: Dialogue | null | undefined;
}

export function useFormSubmission({
	activeDialogueId,
	activeDialogue,
	addSubmission,
	getPreviousDialogue,
	markDialogueCompleted,
	resetSubmissionLoadingState,
	setSubmissionResponse,
	submitAndPollTask,
}: UseFormSubmissionProps) {
	// Submit form handler
	const handleSubmit = useCallback(
		async (values: FormValues & { dialogueId?: number }) => {
			if (!activeDialogue) return;

			// 确保dialogueId有值
			const dialogueId = values.dialogueId || activeDialogueId;

			try {
				const history = getPreviousDialogue(dialogueId);

				// addSubmission函数会生成submissionId，内部添加到TaskParams中
				const submissionId = addSubmission(dialogueId, {
					...values,
					dialogueId,
					submissionId: 0, // 这个值会被addSubmission内部重写
				});

				// Submit task and start polling
				const taskResult = await submitAndPollTask({
					...values,
					dialogueId,
					submissionId,
					history: history
						? [{ prompt: history.prompt, response: history.response }]
						: undefined,
				});

				const response: PollTaskResult = {
					taskId: taskResult.taskId,
					code: taskResult.code,
					advices: taskResult.advices,
					usage: taskResult.usage,
					status: taskResult.status,
					error: taskResult.error,
				};

				setSubmissionResponse(dialogueId, submissionId, response);
				markDialogueCompleted(dialogueId);

				return taskResult;
			} catch (error) {
				resetSubmissionLoadingState();
				console.error("Error submitting form:", error);
				throw error;
			}
		},
		[
			activeDialogueId,
			activeDialogue,
			addSubmission,
			getPreviousDialogue,
			markDialogueCompleted,
			resetSubmissionLoadingState,
			setSubmissionResponse,
			submitAndPollTask,
		],
	);

	return { handleSubmit };
}
