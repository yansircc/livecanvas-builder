import type { Dialogue } from "@/types/common";
import type { AvailableModelId, AvailableProviderId } from "@/types/model";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createActions } from "./actions";
import type { DialogueState } from "./types";

// Default provider and model values
const defaultProviderId: AvailableProviderId = "anthropic";
const defaultModelId: AvailableModelId = "claude-3-7-sonnet-20250219";

// Initial dialogue
const defaultDialogue: Dialogue = {
	id: 1,
	submissions: [],
	activeSubmissionId: null,
	selectedProviderId: defaultProviderId,
	selectedModelId: defaultModelId,
};

export const useDialogueStore = create<DialogueState>()(
	persist(
		(set, get) => ({
			dialogues: [defaultDialogue],
			activeDialogueId: 1,
			defaultProviderId,
			defaultModelId,
			...createActions(set, get),
		}),
		{
			name: "dialogue-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				dialogues: state.dialogues,
				activeDialogueId: state.activeDialogueId,
				defaultProviderId: state.defaultProviderId,
				defaultModelId: state.defaultModelId,
			}),
		},
	),
);

export type { DialogueState } from "./types";
export type { DialogueActions } from "./actions";
