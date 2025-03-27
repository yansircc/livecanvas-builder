import type { Dialogue } from "@/types/common";
import type { AvailableModelId, AvailableProviderId } from "@/types/model";
import type { DialogueState, GetState, SetState } from "../types";

export const createModelActions = (set: SetState, get: GetState) => ({
	setGlobalModel: (
		providerId: AvailableProviderId,
		modelId: AvailableModelId,
	) =>
		set((state: DialogueState) => {
			// Update all dialogues that were using the previous default
			const updatedDialogues = state.dialogues.map((dialogue) => {
				// If this dialogue was using the default, update it to the new default
				if (
					!dialogue.selectedProviderId ||
					!dialogue.selectedModelId ||
					(dialogue.selectedProviderId === state.defaultProviderId &&
						dialogue.selectedModelId === state.defaultModelId)
				) {
					return {
						...dialogue,
						selectedProviderId: providerId,
						selectedModelId: modelId,
					} as Dialogue;
				}
				return dialogue;
			});

			return {
				defaultProviderId: providerId,
				defaultModelId: modelId,
				dialogues: updatedDialogues,
			};
		}),

	setDialogueSelectedModel: (
		dialogueId: number,
		providerId: AvailableProviderId,
		modelId: AvailableModelId,
	) =>
		set((state: DialogueState) => {
			const dialogueIndex = state.dialogues.findIndex(
				(s) => s.id === dialogueId,
			);
			if (dialogueIndex === -1) return state;

			const updatedDialogues = [...state.dialogues];
			const dialogue = updatedDialogues[dialogueIndex];
			updatedDialogues[dialogueIndex] = {
				...dialogue,
				selectedProviderId: providerId,
				selectedModelId: modelId,
			} as Dialogue;

			return { dialogues: updatedDialogues };
		}),

	getSelectedProvider: () => {
		const state = get();
		const activeDialogue = state.dialogues.find(
			(s) => s.id === state.activeDialogueId,
		);
		const activeSubmission = activeDialogue?.submissions.find(
			(s) => s.id === activeDialogue.activeSubmissionId,
		);

		// First priority: use the active submission's model if available
		if (activeSubmission?.input.providerId) {
			return activeSubmission.input.providerId;
		}

		// Second priority: use the dialogue's selected provider
		if (activeDialogue?.selectedProviderId) {
			return activeDialogue.selectedProviderId;
		}

		// Fallback to global default
		return state.defaultProviderId;
	},

	getSelectedModelId: () => {
		const state = get();
		const activeDialogue = state.dialogues.find(
			(s) => s.id === state.activeDialogueId,
		);
		const activeSubmission = activeDialogue?.submissions.find(
			(s) => s.id === activeDialogue.activeSubmissionId,
		);

		// First priority: use the active submission's model if available
		if (activeSubmission?.input.modelId) {
			return activeSubmission.input.modelId;
		}

		// Second priority: use the dialogue's selected model
		if (activeDialogue?.selectedModelId) {
			return activeDialogue.selectedModelId;
		}

		// Fallback to global default
		return state.defaultModelId;
	},
});
