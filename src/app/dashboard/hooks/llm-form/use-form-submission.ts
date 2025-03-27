import type {
	DialogueHistory,
	PollTaskResult,
	TaskRequest,
} from "@/types/common";
import type { Dialogue } from "@/types/common";
import { useCallback } from "react";
import type { FormValues } from "./schema";

export interface UseFormSubmissionProps {
	activeDialogueId: number;
	getPreviousDialogue: (dialogueId: number) => DialogueHistory | null;
	addVersion: (dialogueId: number, input: TaskRequest) => number;
	submitAndPollTask: (params: TaskRequest) => Promise<PollTaskResult>;
	setVersionResponse: (
		dialogueId: number,
		versionId: number,
		response: PollTaskResult,
	) => void;
	markDialogueCompleted: (dialogueId: number) => void;
	resetVersionLoadingState: () => void;
	activeDialogue: Dialogue | null | undefined;
}

export function useFormSubmission({
	activeDialogueId,
	activeDialogue,
	addVersion,
	getPreviousDialogue,
	markDialogueCompleted,
	resetVersionLoadingState,
	setVersionResponse,
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

				// addVersion函数会生成versionId，内部添加到TaskParams中
				const versionId = addVersion(dialogueId, {
					...values,
					dialogueId,
					versionId: 0, // 这个值会被addVersion内部重写
				});

				// Submit task and start polling
				const taskResult = await submitAndPollTask({
					...values,
					dialogueId,
					versionId,
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

				setVersionResponse(dialogueId, versionId, response);
				markDialogueCompleted(dialogueId);

				return taskResult;
			} catch (error) {
				resetVersionLoadingState();
				console.error("Error submitting form:", error);
				throw error;
			}
		},
		[
			activeDialogueId,
			activeDialogue,
			addVersion,
			getPreviousDialogue,
			markDialogueCompleted,
			resetVersionLoadingState,
			setVersionResponse,
			submitAndPollTask,
		],
	);

	return { handleSubmit };
}
