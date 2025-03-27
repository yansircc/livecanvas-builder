import type { AvailableModelId, AvailableProviderId } from "@/lib/models";
import type {
	Dialogue,
	DialogueHistory,
	PollTaskResult,
	TaskRequest,
	TaskStatus,
	TokenUsage,
	Version,
} from "@/types/common";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface DialogueState {
	dialogues: Dialogue[];
	activeDialogueId: number;
	globalSelectedProviderId: AvailableProviderId;
	globalSelectedModelId: AvailableModelId;

	// Getters
	getActiveDialogue: () => Dialogue | undefined;
	getActiveVersion: () => Version | undefined;
	getDialogueVersion: (
		dialogueId: number,
		versionId: number,
	) => Version | undefined;
	getPreviousDialogue: (dialogueId: number) => DialogueHistory | null;
	getSelectedProvider: () => AvailableProviderId;
	getSelectedModelId: () => AvailableModelId;

	// Actions
	addDialogue: () => void;
	clearAllDialogues: () => void;
	setActiveDialogue: (dialogueId: number) => void;
	addVersion: (dialogueId: number, input: TaskRequest) => number;
	setVersionResponse: (
		dialogueId: number,
		versionId: number,
		response: PollTaskResult,
	) => void;
	setVersionLoading: (
		dialogueId: number,
		versionId: number,
		isLoading: boolean,
	) => void;
	setVersionTaskStatus: (
		dialogueId: number,
		versionId: number,
		status: TaskStatus,
		error?: string,
	) => void;
	setActiveVersion: (dialogueId: number, versionId: number) => void;
	setGlobalModel: (
		providerId: AvailableProviderId,
		modelId: AvailableModelId,
	) => void;
	cleanupIncompleteVersions: () => void;
	deleteVersion: (dialogueId: number, versionId: number) => void;
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
	versions: [],
	activeVersionId: null,
};

export const useDialogueStore = create<DialogueState>()(
	persist(
		(set, get) => ({
			dialogues: [defaultDialogue],
			activeDialogueId: 1,
			globalSelectedProviderId: defaultProviderId,
			globalSelectedModelId: defaultModelId,

			// Getters
			getActiveDialogue: () => {
				const state = get();
				return state.dialogues.find((s) => s.id === state.activeDialogueId);
			},

			getActiveVersion: () => {
				const activeDialogue = get().getActiveDialogue();
				if (!activeDialogue?.activeVersionId) return undefined;
				return activeDialogue.versions.find(
					(v) => v.id === activeDialogue.activeVersionId,
				);
			},

			getDialogueVersion: (dialogueId, versionId) => {
				const dialogue = get().dialogues.find((s) => s.id === dialogueId);
				return dialogue?.versions.find((v) => v.id === versionId);
			},

			// Actions
			addDialogue: () =>
				set((state) => {
					const newDialogueId =
						Math.max(...state.dialogues.map((s) => s.id), 0) + 1;
					const newDialogue: Dialogue = {
						id: newDialogueId,
						versions: [],
						activeVersionId: null,
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

			addVersion: (dialogueId, input) => {
				let newVersionId = 1;

				set((state) => {
					const dialogueIndex = state.dialogues.findIndex(
						(s) => s.id === dialogueId,
					);
					if (dialogueIndex === -1) return state;

					const targetDialogue = state.dialogues[dialogueIndex];
					if (!targetDialogue) return state;

					newVersionId =
						targetDialogue.versions.length > 0
							? Math.max(...targetDialogue.versions.map((v) => v.id)) + 1
							: 1;

					// Ensure the provider and model IDs are included in the input
					const inputWithModel = {
						...input,
						providerId: input.providerId || state.globalSelectedProviderId,
						modelId: input.modelId || state.globalSelectedModelId,
					};

					const newVersion: Version = {
						id: newVersionId,
						input: inputWithModel,
						response: null,
						isLoading: true,
					};

					const updatedDialogue: Dialogue = {
						...targetDialogue,
						versions: [...targetDialogue.versions, newVersion],
						activeVersionId: newVersionId,
					};

					const updatedDialogues = [...state.dialogues];
					updatedDialogues[dialogueIndex] = updatedDialogue;

					return { dialogues: updatedDialogues };
				});

				return newVersionId;
			},

			setVersionResponse: (dialogueId, versionId, response) =>
				set((state) => {
					const dialogueIndex = state.dialogues.findIndex(
						(s) => s.id === dialogueId,
					);
					if (dialogueIndex === -1) return state;

					const targetDialogue = state.dialogues[dialogueIndex];
					if (!targetDialogue) return state;

					const versionIndex = targetDialogue.versions.findIndex(
						(v) => v.id === versionId,
					);
					if (versionIndex === -1) return state;

					const targetVersion = targetDialogue.versions[versionIndex];
					if (!targetVersion) return state;

					const updatedVersion: Version = {
						...targetVersion,
						response,
						isLoading: false,
					};

					const updatedVersions = [...targetDialogue.versions];
					updatedVersions[versionIndex] = updatedVersion;

					const updatedDialogue: Dialogue = {
						...targetDialogue,
						versions: updatedVersions,
					};

					const updatedDialogues = [...state.dialogues];
					updatedDialogues[dialogueIndex] = updatedDialogue;

					return { dialogues: updatedDialogues };
				}),

			setVersionLoading: (dialogueId, versionId, isLoading) =>
				set((state) => {
					const dialogueIndex = state.dialogues.findIndex(
						(s) => s.id === dialogueId,
					);
					if (dialogueIndex === -1) return state;

					const targetDialogue = state.dialogues[dialogueIndex];
					if (!targetDialogue) return state;

					const versionIndex = targetDialogue.versions.findIndex(
						(v) => v.id === versionId,
					);
					if (versionIndex === -1) return state;

					const targetVersion = targetDialogue.versions[versionIndex];
					if (!targetVersion) return state;

					const updatedVersion: Version = {
						...targetVersion,
						isLoading,
					};

					const updatedVersions = [...targetDialogue.versions];
					updatedVersions[versionIndex] = updatedVersion;

					const updatedDialogue: Dialogue = {
						...targetDialogue,
						versions: updatedVersions,
					};

					const updatedDialogues = [...state.dialogues];
					updatedDialogues[dialogueIndex] = updatedDialogue;

					return { dialogues: updatedDialogues };
				}),

			setVersionTaskStatus: (dialogueId, versionId, status, error) =>
				set((state) => {
					const dialogueIndex = state.dialogues.findIndex(
						(s) => s.id === dialogueId,
					);
					if (dialogueIndex === -1) return state;

					const targetDialogue = state.dialogues[dialogueIndex];
					if (!targetDialogue) return state;

					const versionIndex = targetDialogue.versions.findIndex(
						(v) => v.id === versionId,
					);
					if (versionIndex === -1) return state;

					const targetVersion = targetDialogue.versions[versionIndex];
					if (!targetVersion) return state;

					const updatedVersion: Version = {
						...targetVersion,
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

					const updatedVersions = [...targetDialogue.versions];
					updatedVersions[versionIndex] = updatedVersion;

					const updatedDialogue: Dialogue = {
						...targetDialogue,
						versions: updatedVersions,
					};

					const updatedDialogues = [...state.dialogues];
					updatedDialogues[dialogueIndex] = updatedDialogue;

					return { dialogues: updatedDialogues };
				}),

			setActiveVersion: (dialogueId, versionId) =>
				set((state) => {
					const dialogueIndex = state.dialogues.findIndex(
						(s) => s.id === dialogueId,
					);
					if (dialogueIndex === -1) return state;

					const targetDialogue = state.dialogues[dialogueIndex];
					if (!targetDialogue) return state;

					const updatedDialogue: Dialogue = {
						...targetDialogue,
						activeVersionId: versionId,
					};

					const updatedDialogues = [...state.dialogues];
					updatedDialogues[dialogueIndex] = updatedDialogue;

					return { dialogues: updatedDialogues };
				}),

			setGlobalModel: (providerId, modelId) =>
				set(() => ({
					globalSelectedProviderId: providerId,
					globalSelectedModelId: modelId,
				})),

			getPreviousDialogue: (dialogueId) => {
				const state = get();
				const dialogue = state.dialogues.find((s) => s.id === dialogueId);

				if (!dialogue || dialogue.versions.length === 0) {
					return null;
				}

				// Get the last version that has a response
				const versionsWithResponses = dialogue.versions
					.filter((v) => v.response !== null)
					.sort((a, b) => b.id - a.id);

				if (versionsWithResponses.length === 0) {
					return null;
				}

				const lastVersion = versionsWithResponses[0];

				if (!lastVersion || !lastVersion.response) {
					return null;
				}

				// Try to parse the content as JSON to extract the code
				let responseContent: {
					code: string;
					advices?: string[];
					usage?: TokenUsage;
				};

				try {
					responseContent = JSON.parse(lastVersion.response.code);
				} catch (error) {
					// If parsing fails, use the content directly
					responseContent = {
						code: lastVersion.response.code,
					};
				}

				return {
					prompt: lastVersion.input.prompt,
					response: responseContent.code,
				};
			},

			getSelectedProvider: () => {
				const state = get();
				return state.globalSelectedProviderId;
			},

			getSelectedModelId: () => {
				const state = get();
				return state.globalSelectedModelId;
			},

			cleanupIncompleteVersions: () =>
				set((state) => {
					const updatedDialogues = state.dialogues.map((dialogue) => {
						// Filter out versions that are loading but have no taskStatus (incomplete)
						const updatedVersions = dialogue.versions.filter(
							(version) => !(version.isLoading && !version.taskStatus),
						);

						// If all versions were incomplete, keep at least one to avoid empty dialogue
						const finalVersions =
							updatedVersions.length > 0
								? updatedVersions
								: dialogue.versions.length > 0 && dialogue.versions[0]
									? [
											{
												id: dialogue.versions[0].id,
												input: dialogue.versions[0].input,
												isLoading: false,
												response: dialogue.versions[0].response || null,
											},
										]
									: [];

						// Reset activeVersionId if it was part of the removed versions
						const activeVersionStillExists = finalVersions.some(
							(v) => v.id === dialogue.activeVersionId,
						);

						const activeVersionId = activeVersionStillExists
							? dialogue.activeVersionId
							: finalVersions.length > 0
								? finalVersions[finalVersions.length - 1]?.id || null
								: null;

						return {
							...dialogue,
							versions: finalVersions,
							activeVersionId,
						};
					});

					return { dialogues: updatedDialogues };
				}),

			deleteVersion: (dialogueId, versionId) =>
				set((state) => {
					const dialogueIndex = state.dialogues.findIndex(
						(s) => s.id === dialogueId,
					);
					if (dialogueIndex === -1) return state;

					const targetDialogue = state.dialogues[dialogueIndex];
					if (!targetDialogue) return state;

					// Can't delete if it's the only version
					if (targetDialogue.versions.length <= 1) return state;

					const updatedVersions = targetDialogue.versions.filter(
						(v) => v.id !== versionId,
					);

					// If the active version is being deleted, set the last version as active
					let activeVersionId = targetDialogue.activeVersionId;
					if (activeVersionId === versionId && updatedVersions.length > 0) {
						activeVersionId =
							updatedVersions[updatedVersions.length - 1]?.id ?? null;
					}

					const updatedDialogue: Dialogue = {
						...targetDialogue,
						versions: updatedVersions,
						activeVersionId,
					};

					const updatedDialogues = [...state.dialogues];
					updatedDialogues[dialogueIndex] = updatedDialogue;

					return { dialogues: updatedDialogues };
				}),

			deleteDialogue: (dialogueId) =>
				set((state) => {
					// Don't delete if it's the only dialogue
					if (state.dialogues.length <= 1) return state;

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
					dialogue.hasCompletedVersion = true;
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
					dialogue.hasCompletedVersion = false;
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
				globalSelectedProviderId: state.globalSelectedProviderId,
				globalSelectedModelId: state.globalSelectedModelId,
			}),
		},
	),
);
