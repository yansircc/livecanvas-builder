import { useApiKeyStore } from "@/store/use-apikey-store";
import type { Dialogue } from "@/types/common";
import type {
	DialogueHistory,
	PollTaskResult,
	TaskRequest,
} from "@/types/task";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
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
	const router = useRouter();
	// Get the apiKey from the zustand store
	const apiKey = useApiKeyStore((state) => state.apiKey);

	// Submit form handler
	const handleSubmit = useCallback(
		async (values: FormValues & { dialogueId?: number }) => {
			if (!activeDialogue) return;

			// Ensure an API key is available
			if (!apiKey) {
				// Show toast notification guiding the user
				toast.error("缺少API密钥", {
					description: "请先在个人资料页面添加您的 AIHubMix API 密钥才能继续。",
					action: {
						label: "前往设置",
						onClick: () => router.push("/profile/api-keys"),
					},
				});
				return; // Stop submission if no API key
			}

			// Ensure dialogueId has a value
			const dialogueId = values.dialogueId || activeDialogueId;

			try {
				const history = getPreviousDialogue(dialogueId);

				// addSubmission function generates submissionId, added internally to TaskParams
				const submissionId = addSubmission(dialogueId, {
					...values,
					apiKey, // Include the API key here
					dialogueId,
					submissionId: 0, // This value will be overwritten inside addSubmission
				});

				// Submit task and start polling, passing the apiKey
				const taskResult = await submitAndPollTask({
					...values,
					apiKey, // Pass the API key here as well
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
			apiKey,
			router,
		],
	);

	return { handleSubmit };
}
