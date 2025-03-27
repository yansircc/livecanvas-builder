import type { Dialogue } from "@/types/common";
import {
	defaultDialogue,
	defaultModelId,
	defaultProviderId,
} from "../constants";
import type { DialogueState, GetState, SetState } from "../types";

export const createDialogueActions = (set: SetState, get: GetState) => ({
	addDialogue: () =>
		set((state: DialogueState) => {
			const newDialogueId =
				Math.max(...state.dialogues.map((s) => s.id), 0) + 1;

			// Get the most recently used model from the active dialogue if available
			let selectedProviderId = state.defaultProviderId;
			let selectedModelId = state.defaultModelId;

			const activeDialogue = state.dialogues.find(
				(s) => s.id === state.activeDialogueId,
			);

			if (activeDialogue) {
				// First try to get from the dialogue's stored selection (highest priority)
				if (
					activeDialogue.selectedProviderId &&
					activeDialogue.selectedModelId
				) {
					selectedProviderId = activeDialogue.selectedProviderId;
					selectedModelId = activeDialogue.selectedModelId;
				}
				// Then try to get from the most recent submission if available
				else if (activeDialogue.submissions.length > 0) {
					// Get the most recent submission with a provider and model
					const lastSubmission = [...activeDialogue.submissions]
						.reverse()
						.find((sub) => sub.input.providerId && sub.input.modelId);

					if (lastSubmission) {
						selectedProviderId = lastSubmission.input.providerId;
						selectedModelId = lastSubmission.input.modelId;
					}
				}
			}

			const newDialogue = {
				...defaultDialogue,
				id: newDialogueId,
				selectedProviderId,
				selectedModelId,
			};

			return {
				dialogues: [...state.dialogues, newDialogue],
				activeDialogueId: newDialogueId,
			};
		}),

	clearAllDialogues: () =>
		set(() => {
			const resetDialogue = {
				...defaultDialogue,
				id: 1,
				submissions: [],
				activeSubmissionId: null,
				selectedProviderId: defaultProviderId,
				selectedModelId: defaultModelId,
			};

			return {
				dialogues: [resetDialogue],
				activeDialogueId: 1,
				defaultProviderId,
				defaultModelId,
			};
		}),

	setActiveDialogue: (dialogueId: number) =>
		set(() => ({
			activeDialogueId: dialogueId,
		})),

	deleteDialogue: (dialogueId: number) =>
		set((state: DialogueState) => {
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
				activeDialogueId = firstDialogue ? firstDialogue.id : activeDialogueId;
			}

			return {
				dialogues: updatedDialogues,
				activeDialogueId,
			};
		}),

	markDialogueCompleted: (dialogueId: number) =>
		set((state: DialogueState) => {
			// Don't mark as completed if it's the active dialogue
			if (dialogueId === state.activeDialogueId) return state;

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

	clearDialogueCompleted: (dialogueId: number) =>
		set((state: DialogueState) => {
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
});
