import type {
	Dialogue,
	DialogueHistory,
	PollTaskResult,
	Submission,
	TaskRequest,
	TaskStatus,
	TokenUsage,
} from "@/types/common";
import type { AvailableModelId, AvailableProviderId } from "@/types/model";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface DialogueState {
	dialogues: Dialogue[];
	activeDialogueId: number;
	defaultProviderId: AvailableProviderId;
	defaultModelId: AvailableModelId;

	// Getters
	getActiveDialogue: () => Dialogue | undefined;
	getActiveSubmission: () => Submission | undefined;
	getDialogueSubmission: (
		dialogueId: number,
		submissionId: number,
	) => Submission | undefined;
	getPreviousDialogue: (dialogueId: number) => DialogueHistory | null;
	getSelectedProvider: () => AvailableProviderId;
	getSelectedModelId: () => AvailableModelId;

	// Actions
	addDialogue: () => void;
	clearAllDialogues: () => void;
	setActiveDialogue: (dialogueId: number) => void;
	addSubmission: (dialogueId: number, input: TaskRequest) => number;
	setSubmissionResponse: (
		dialogueId: number,
		submissionId: number,
		response: PollTaskResult,
	) => void;
	setSubmissionLoading: (
		dialogueId: number,
		submissionId: number,
		isLoading: boolean,
	) => void;
	setSubmissionTaskStatus: (
		dialogueId: number,
		submissionId: number,
		status: TaskStatus,
		error?: string,
	) => void;
	setActiveSubmission: (dialogueId: number, submissionId: number) => void;
	setGlobalModel: (
		providerId: AvailableProviderId,
		modelId: AvailableModelId,
	) => void;
	cleanupIncompleteSubmissions: () => void;
	deleteSubmission: (dialogueId: number, submissionId: number) => void;
	deleteDialogue: (dialogueId: number) => void;
	markDialogueCompleted: (dialogueId: number) => void;
	clearDialogueCompleted: (dialogueId: number) => void;
}

// Default provider and model values
const defaultProviderId: AvailableProviderId = "anthropic";
const defaultModelId: AvailableModelId = "claude-3-7-sonnet-20250219";

// Initial dialogue
const defaultDialogue: Dialogue = {
	id: 1,
	submissions: [],
	activeSubmissionId: null,
};

export const useDialogueStore = create<DialogueState>()(
	persist(
		(set, get) => ({
			dialogues: [defaultDialogue],
			activeDialogueId: 1,
			defaultProviderId: defaultProviderId,
			defaultModelId: defaultModelId,

			// Getters
			getActiveDialogue: () => {
				const state = get();
				return state.dialogues.find((s) => s.id === state.activeDialogueId);
			},

			getActiveSubmission: () => {
				const activeDialogue = get().getActiveDialogue();
				if (!activeDialogue?.activeSubmissionId) return undefined;
				return activeDialogue.submissions.find(
					(v) => v.id === activeDialogue.activeSubmissionId,
				);
			},

			getDialogueSubmission: (dialogueId, submissionId) => {
				const dialogue = get().dialogues.find((s) => s.id === dialogueId);
				return dialogue?.submissions.find((v) => v.id === submissionId);
			},

			// Actions
			addDialogue: () =>
				set((state) => {
					const newDialogueId =
						Math.max(...state.dialogues.map((s) => s.id), 0) + 1;
					const newDialogue: Dialogue = {
						id: newDialogueId,
						submissions: [],
						activeSubmissionId: null,
					};

					return {
						dialogues: [...state.dialogues, newDialogue],
						activeDialogueId: newDialogueId,
					};
				}),

			clearAllDialogues: () =>
				set(() => ({
					dialogues: [
						{
							...defaultDialogue,
						},
					],
					activeDialogueId: 1,
				})),

			setActiveDialogue: (dialogueId) =>
				set(() => ({
					activeDialogueId: dialogueId,
				})),

			addSubmission: (dialogueId, input) => {
				let newSubmissionId = 1;

				set((state) => {
					const dialogueIndex = state.dialogues.findIndex(
						(s) => s.id === dialogueId,
					);
					if (dialogueIndex === -1) return state;

					const targetDialogue = state.dialogues[dialogueIndex];
					if (!targetDialogue) return state;

					newSubmissionId =
						targetDialogue.submissions.length > 0
							? Math.max(...targetDialogue.submissions.map((v) => v.id)) + 1
							: 1;

					// Ensure the provider and model IDs are included in the input
					const inputWithModel = {
						...input,
						providerId: input.providerId,
						modelId: input.modelId,
					};

					const newSubmission: Submission = {
						id: newSubmissionId,
						input: inputWithModel,
						response: null,
						isLoading: true,
					};

					const updatedDialogue: Dialogue = {
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

			setSubmissionResponse: (dialogueId, submissionId, response) =>
				set((state) => {
					const dialogueIndex = state.dialogues.findIndex(
						(s) => s.id === dialogueId,
					);
					if (dialogueIndex === -1) return state;

					const targetDialogue = state.dialogues[dialogueIndex];
					if (!targetDialogue) return state;

					const submissionIndex = targetDialogue.submissions.findIndex(
						(v) => v.id === submissionId,
					);
					if (submissionIndex === -1) return state;

					const targetSubmission = targetDialogue.submissions[submissionIndex];
					if (!targetSubmission) return state;

					const updatedSubmission: Submission = {
						...targetSubmission,
						response,
						isLoading: false,
					};

					const updatedSubmissions = [...targetDialogue.submissions];
					updatedSubmissions[submissionIndex] = updatedSubmission;

					const updatedDialogue: Dialogue = {
						...targetDialogue,
						submissions: updatedSubmissions,
					};

					const updatedDialogues = [...state.dialogues];
					updatedDialogues[dialogueIndex] = updatedDialogue;

					return { dialogues: updatedDialogues };
				}),

			setSubmissionLoading: (dialogueId, submissionId, isLoading) =>
				set((state) => {
					const dialogueIndex = state.dialogues.findIndex(
						(s) => s.id === dialogueId,
					);
					if (dialogueIndex === -1) return state;

					const targetDialogue = state.dialogues[dialogueIndex];
					if (!targetDialogue) return state;

					const submissionIndex = targetDialogue.submissions.findIndex(
						(v) => v.id === submissionId,
					);
					if (submissionIndex === -1) return state;

					const targetSubmission = targetDialogue.submissions[submissionIndex];
					if (!targetSubmission) return state;

					const updatedSubmission: Submission = {
						...targetSubmission,
						isLoading,
					};

					const updatedSubmissions = [...targetDialogue.submissions];
					updatedSubmissions[submissionIndex] = updatedSubmission;

					const updatedDialogue: Dialogue = {
						...targetDialogue,
						submissions: updatedSubmissions,
					};

					const updatedDialogues = [...state.dialogues];
					updatedDialogues[dialogueIndex] = updatedDialogue;

					return { dialogues: updatedDialogues };
				}),

			setSubmissionTaskStatus: (dialogueId, submissionId, status, error) =>
				set((state) => {
					const dialogueIndex = state.dialogues.findIndex(
						(s) => s.id === dialogueId,
					);
					if (dialogueIndex === -1) return state;

					const targetDialogue = state.dialogues[dialogueIndex];
					if (!targetDialogue) return state;

					const submissionIndex = targetDialogue.submissions.findIndex(
						(v) => v.id === submissionId,
					);
					if (submissionIndex === -1) return state;

					const targetSubmission = targetDialogue.submissions[submissionIndex];
					if (!targetSubmission) return state;

					const updatedSubmission: Submission = {
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

					const updatedDialogue: Dialogue = {
						...targetDialogue,
						submissions: updatedSubmissions,
					};

					const updatedDialogues = [...state.dialogues];
					updatedDialogues[dialogueIndex] = updatedDialogue;

					return { dialogues: updatedDialogues };
				}),

			setActiveSubmission: (dialogueId, submissionId) =>
				set((state) => {
					const dialogueIndex = state.dialogues.findIndex(
						(s) => s.id === dialogueId,
					);
					if (dialogueIndex === -1) return state;

					const targetDialogue = state.dialogues[dialogueIndex];
					if (!targetDialogue) return state;

					const updatedDialogue: Dialogue = {
						...targetDialogue,
						activeSubmissionId: submissionId,
					};

					const updatedDialogues = [...state.dialogues];
					updatedDialogues[dialogueIndex] = updatedDialogue;

					return { dialogues: updatedDialogues };
				}),

			setGlobalModel: (providerId, modelId) =>
				set(() => ({
					defaultProviderId: providerId,
					defaultModelId: modelId,
				})),

			getPreviousDialogue: (dialogueId) => {
				const state = get();
				const dialogue = state.dialogues.find((s) => s.id === dialogueId);

				if (!dialogue || dialogue.submissions.length === 0) {
					return null;
				}

				// Get the last submission that has a response
				const submissionsWithResponses = dialogue.submissions
					.filter((v) => v.response !== null)
					.sort((a, b) => b.id - a.id);

				if (submissionsWithResponses.length === 0) {
					return null;
				}

				const lastSubmission = submissionsWithResponses[0];

				if (!lastSubmission || !lastSubmission.response) {
					return null;
				}

				// Try to parse the content as JSON to extract the code
				let responseContent: {
					code: string;
					advices?: string[];
					usage?: TokenUsage;
				};

				try {
					responseContent = JSON.parse(lastSubmission.response.code);
				} catch (error) {
					// If parsing fails, use the content directly
					responseContent = {
						code: lastSubmission.response.code,
					};
				}

				return {
					prompt: lastSubmission.input.prompt,
					response: responseContent.code,
				};
			},

			getSelectedProvider: () => {
				const state = get();
				const activeSubmission = state.getActiveSubmission();
				if (!activeSubmission) return state.defaultProviderId;
				return activeSubmission.input.providerId;
			},

			getSelectedModelId: () => {
				const state = get();
				const activeSubmission = state.getActiveSubmission();
				if (!activeSubmission) return state.defaultModelId;
				return activeSubmission.input.modelId;
			},

			cleanupIncompleteSubmissions: () =>
				set((state) => {
					const updatedDialogues = state.dialogues.map((dialogue) => {
						// Filter out submissions that are loading but have no taskStatus (incomplete)
						const updatedSubmissions = dialogue.submissions.filter(
							(submission) => !(submission.isLoading && !submission.taskStatus),
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
							(v) => v.id === dialogue.activeSubmissionId,
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

			deleteSubmission: (dialogueId, submissionId) =>
				set((state) => {
					const dialogueIndex = state.dialogues.findIndex(
						(s) => s.id === dialogueId,
					);
					if (dialogueIndex === -1) return state;

					const targetDialogue = state.dialogues[dialogueIndex];
					if (!targetDialogue) return state;

					// Can't delete if it's the only submission
					if (targetDialogue.submissions.length <= 1) return state;

					const updatedSubmissions = targetDialogue.submissions.filter(
						(v) => v.id !== submissionId,
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

					const updatedDialogue: Dialogue = {
						...targetDialogue,
						submissions: updatedSubmissions,
						activeSubmissionId,
					};

					const updatedDialogues = [...state.dialogues];
					updatedDialogues[dialogueIndex] = updatedDialogue;

					return { dialogues: updatedDialogues };
				}),

			deleteDialogue: (dialogueId) =>
				set((state) => {
					// If it's the last dialogue, reset to initial state
					if (state.dialogues.length <= 1) {
						return {
							dialogues: [defaultDialogue],
							activeDialogueId: 1,
						};
					}

					const updatedDialogues = state.dialogues.filter(
						(s) => s.id !== dialogueId,
					);

					// If the active dialogue is deleted, set the first available dialogue as active
					let activeDialogueId = state.activeDialogueId;
					if (activeDialogueId === dialogueId && updatedDialogues.length > 0) {
						const firstDialogue = updatedDialogues[0];
						activeDialogueId = firstDialogue
							? firstDialogue.id
							: activeDialogueId;
					}

					return {
						dialogues: updatedDialogues,
						activeDialogueId,
					};
				}),

			markDialogueCompleted: (dialogueId) =>
				set((state) => {
					const dialogueIndex = state.dialogues.findIndex(
						(s) => s.id === dialogueId,
					);
					if (dialogueIndex === -1) return state;

					const updatedDialogues = [...state.dialogues];
					const dialogue = { ...updatedDialogues[dialogueIndex] };
					dialogue.hasCompletedSubmission = true;
					updatedDialogues[dialogueIndex] = dialogue as Dialogue;

					return { dialogues: updatedDialogues };
				}),

			clearDialogueCompleted: (dialogueId) =>
				set((state) => {
					const dialogueIndex = state.dialogues.findIndex(
						(s) => s.id === dialogueId,
					);
					if (dialogueIndex === -1) return state;

					const updatedDialogues = [...state.dialogues];
					const dialogue = { ...updatedDialogues[dialogueIndex] };
					dialogue.hasCompletedSubmission = false;
					updatedDialogues[dialogueIndex] = dialogue as Dialogue;

					return { dialogues: updatedDialogues };
				}),
		}),
		{
			name: "dialogue-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				dialogues: state.dialogues,
				activeDialogueId: state.activeDialogueId,
			}),
		},
	),
);
