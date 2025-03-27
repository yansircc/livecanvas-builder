import type {
	DialogueHistory,
	LlmResponse,
	TaskParams,
	TaskResult,
} from "@/types/common";
import type { Dialogue } from "@/types/common";
import { useCallback } from "react";
import type { FormValues } from "./schema";

export interface UseFormSubmissionProps {
	activeDialogueId: number;
	getPreviousDialogue: (dialogueId: number) => DialogueHistory | null;
	addVersion: (dialogueId: number, values: FormValues) => number;
	submitAndPollTask: (params: TaskParams) => Promise<TaskResult>;
	setVersionResponse: (
		dialogueId: number,
		versionId: number,
		response: LlmResponse,
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
		async (values: FormValues) => {
			if (!activeDialogue) return;

			try {
				const history = getPreviousDialogue(activeDialogueId);
				const versionId = addVersion(activeDialogueId, values);

				// Submit task and start polling
				const taskResult = await submitAndPollTask({
					...values,
					dialogueId: activeDialogueId,
					versionId,
					history: history
						? [{ prompt: history.prompt, response: history.response }]
						: undefined,
				});

				const response: LlmResponse = {
					content: JSON.stringify({
						code: taskResult.code,
						advices: taskResult.advices,
						usage: taskResult.usage,
					}),
					timestamp: Date.now(),
					usage: taskResult.usage,
					advices: taskResult.advices,
				};

				setVersionResponse(activeDialogueId, versionId, response);
				markDialogueCompleted(activeDialogueId);

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
