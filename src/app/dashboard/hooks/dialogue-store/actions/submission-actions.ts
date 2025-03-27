import type { PersistedSubmission } from "@/types/common";
import type { PollTaskResult, TaskRequest, TaskStatus } from "@/types/task";
import type { DialogueState, GetState, SetState } from "../types";

export const createSubmissionActions = (set: SetState, get: GetState) => ({
	addSubmission: (dialogueId: number, input: TaskRequest) => {
		let newSubmissionId = 1;

		set((state: DialogueState) => {
			const dialogueIndex = state.dialogues.findIndex(
				(s: { id: number }) => s.id === dialogueId,
			);
			if (dialogueIndex === -1) return state;

			const targetDialogue = state.dialogues[dialogueIndex];
			if (!targetDialogue) return state;

			newSubmissionId =
				targetDialogue.submissions.length > 0
					? Math.max(
							...targetDialogue.submissions.map((v: { id: number }) => v.id),
						) + 1
					: 1;

			// Ensure the provider and model IDs are included in the input
			const inputWithModel = {
				...input,
				providerId: input.providerId,
				modelId: input.modelId,
			};

			const newSubmission: PersistedSubmission = {
				id: newSubmissionId,
				input: inputWithModel,
				response: null,
				isLoading: true,
			};

			const updatedDialogue = {
				...targetDialogue,
				submissions: [...targetDialogue.submissions, newSubmission],
				activeSubmissionId: newSubmissionId,
			};

			const updatedDialogues = [...state.dialogues];
			updatedDialogues[dialogueIndex] = updatedDialogue;

			return { dialogues: updatedDialogues };
		});

		return newSubmissionId;
	},

	setSubmissionResponse: (
		dialogueId: number,
		submissionId: number,
		response: PollTaskResult,
	) =>
		set((state: DialogueState) => {
			const dialogueIndex = state.dialogues.findIndex(
				(s: { id: number }) => s.id === dialogueId,
			);
			if (dialogueIndex === -1) return state;

			const targetDialogue = state.dialogues[dialogueIndex];
			if (!targetDialogue) return state;

			const submissionIndex = targetDialogue.submissions.findIndex(
				(v: { id: number }) => v.id === submissionId,
			);
			if (submissionIndex === -1) return state;

			const targetSubmission = targetDialogue.submissions[submissionIndex];
			if (!targetSubmission) return state;

			const updatedSubmission: PersistedSubmission = {
				...targetSubmission,
				response,
				isLoading: false,
			};

			const updatedSubmissions = [...targetDialogue.submissions];
			updatedSubmissions[submissionIndex] = updatedSubmission;

			const updatedDialogue = {
				...targetDialogue,
				submissions: updatedSubmissions,
			};

			const updatedDialogues = [...state.dialogues];
			updatedDialogues[dialogueIndex] = updatedDialogue;

			return { dialogues: updatedDialogues };
		}),

	setSubmissionLoading: (
		dialogueId: number,
		submissionId: number,
		isLoading: boolean,
	) =>
		set((state: DialogueState) => {
			const dialogueIndex = state.dialogues.findIndex(
				(s: { id: number }) => s.id === dialogueId,
			);
			if (dialogueIndex === -1) return state;

			const targetDialogue = state.dialogues[dialogueIndex];
			if (!targetDialogue) return state;

			const submissionIndex = targetDialogue.submissions.findIndex(
				(v: { id: number }) => v.id === submissionId,
			);
			if (submissionIndex === -1) return state;

			const targetSubmission = targetDialogue.submissions[submissionIndex];
			if (!targetSubmission) return state;

			const updatedSubmission: PersistedSubmission = {
				...targetSubmission,
				isLoading,
			};

			const updatedSubmissions = [...targetDialogue.submissions];
			updatedSubmissions[submissionIndex] = updatedSubmission;

			const updatedDialogue = {
				...targetDialogue,
				submissions: updatedSubmissions,
			};

			const updatedDialogues = [...state.dialogues];
			updatedDialogues[dialogueIndex] = updatedDialogue;

			return { dialogues: updatedDialogues };
		}),

	setSubmissionTaskStatus: (
		dialogueId: number,
		submissionId: number,
		status: TaskStatus,
		error?: string,
	) =>
		set((state: DialogueState) => {
			const dialogueIndex = state.dialogues.findIndex(
				(s: { id: number }) => s.id === dialogueId,
			);
			if (dialogueIndex === -1) return state;

			const targetDialogue = state.dialogues[dialogueIndex];
			if (!targetDialogue) return state;

			const submissionIndex = targetDialogue.submissions.findIndex(
				(v: { id: number }) => v.id === submissionId,
			);
			if (submissionIndex === -1) return state;

			const targetSubmission = targetDialogue.submissions[submissionIndex];
			if (!targetSubmission) return state;

			const updatedSubmission: PersistedSubmission = {
				...targetSubmission,
				taskStatus: status,
				taskError: error,
				isLoading: ![
					"COMPLETED",
					"FAILED",
					"CRASHED",
					"SYSTEM_FAILURE",
					"INTERRUPTED",
					"CANCELED",
				].includes(status),
			};

			const updatedSubmissions = [...targetDialogue.submissions];
			updatedSubmissions[submissionIndex] = updatedSubmission;

			const updatedDialogue = {
				...targetDialogue,
				submissions: updatedSubmissions,
			};

			const updatedDialogues = [...state.dialogues];
			updatedDialogues[dialogueIndex] = updatedDialogue;

			return { dialogues: updatedDialogues };
		}),

	setActiveSubmission: (dialogueId: number, submissionId: number) =>
		set((state: DialogueState) => {
			const dialogueIndex = state.dialogues.findIndex(
				(s: { id: number }) => s.id === dialogueId,
			);
			if (dialogueIndex === -1) return state;

			const targetDialogue = state.dialogues[dialogueIndex];
			if (!targetDialogue) return state;

			const updatedDialogue = {
				...targetDialogue,
				activeSubmissionId: submissionId,
			};

			const updatedDialogues = [...state.dialogues];
			updatedDialogues[dialogueIndex] = updatedDialogue;

			return { dialogues: updatedDialogues };
		}),

	deleteSubmission: (dialogueId: number, submissionId: number) =>
		set((state: DialogueState) => {
			const dialogueIndex = state.dialogues.findIndex(
				(s: { id: number }) => s.id === dialogueId,
			);
			if (dialogueIndex === -1) return state;

			const targetDialogue = state.dialogues[dialogueIndex];
			if (!targetDialogue) return state;

			// Can't delete if it's the only submission
			if (targetDialogue.submissions.length <= 1) return state;

			const updatedSubmissions = targetDialogue.submissions.filter(
				(v: { id: number }) => v.id !== submissionId,
			);

			// If the active submission is being deleted, set the last submission as active
			let activeSubmissionId = targetDialogue.activeSubmissionId;
			if (
				activeSubmissionId === submissionId &&
				updatedSubmissions.length > 0
			) {
				activeSubmissionId =
					updatedSubmissions[updatedSubmissions.length - 1]?.id ?? null;
			}

			const updatedDialogue = {
				...targetDialogue,
				submissions: updatedSubmissions,
				activeSubmissionId,
			};

			const updatedDialogues = [...state.dialogues];
			updatedDialogues[dialogueIndex] = updatedDialogue;

			return { dialogues: updatedDialogues };
		}),

	cleanupIncompleteSubmissions: () =>
		set((state: DialogueState) => {
			const updatedDialogues = state.dialogues.map((dialogue) => {
				// Filter out submissions that are loading but have no taskStatus (incomplete)
				const updatedSubmissions = dialogue.submissions.filter(
					(submission: PersistedSubmission) =>
						!(submission.isLoading && !submission.taskStatus),
				);

				// If all submissions were incomplete, keep at least one to avoid empty dialogue
				const finalSubmissions =
					updatedSubmissions.length > 0
						? updatedSubmissions
						: dialogue.submissions.length > 0 && dialogue.submissions[0]
							? [
									{
										id: dialogue.submissions[0].id,
										input: dialogue.submissions[0].input,
										isLoading: false,
										response: dialogue.submissions[0].response || null,
									},
								]
							: [];

				// Reset activeSubmissionId if it was part of the removed submissions
				const activeSubmissionStillExists = finalSubmissions.some(
					(v: { id: number }) => v.id === dialogue.activeSubmissionId,
				);

				const activeSubmissionId = activeSubmissionStillExists
					? dialogue.activeSubmissionId
					: finalSubmissions.length > 0
						? finalSubmissions[finalSubmissions.length - 1]?.id || null
						: null;

				return {
					...dialogue,
					submissions: finalSubmissions,
					activeSubmissionId,
				};
			});

			return { dialogues: updatedDialogues };
		}),
});
