import type { AvailableModelId, AvailableProviderId } from "@/lib/models";
import type { TaskStatus } from "@/types/task";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FormData {
	prompt: string;
	history?: DialogueHistory[];
	providerId?: AvailableProviderId;
	modelId?: AvailableModelId;
	withBackgroundInfo?: boolean;
	precisionMode?: boolean;
}

export interface DialogueHistory {
	prompt: string;
	response: string;
}

export interface TokenUsage {
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
}

export interface LlmResponse {
	content: string;
	timestamp: number;
	usage?: TokenUsage;
	advices?: string[];
}

export interface Version {
	id: number;
	input: FormData;
	response: LlmResponse | null;
	isLoading: boolean;
	taskStatus?: TaskStatus;
	taskError?: string;
}

export interface Dialogue {
	id: number;
	versions: Version[];
	activeVersionId: number | null;
	hasCompletedVersion?: boolean;
}

interface LlmDialogueState {
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

	// Actions
	addDialogue: () => void;
	clearAllDialogues: () => void;
	setActiveDialogue: (dialogueId: number) => void;
	addVersion: (dialogueId: number, input: FormData) => number;
	setVersionResponse: (
		dialogueId: number,
		versionId: number,
		response: LlmResponse,
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
	getPreviousDialogue: (dialogueId: number) => DialogueHistory | null;
	getSelectedProvider: () => AvailableProviderId;
	getSelectedModelId: () => AvailableModelId;
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

export const useLlmDialogueStore = create<LlmDialogueState>()(
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
					.sort((a, b) => b.id - a.id); // Sort by id descending

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
					responseContent = JSON.parse(lastVersion.response.content);
				} catch (error) {
					// If parsing fails, use the content directly
					responseContent = {
						code: lastVersion.response.content,
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
						// Filter out versions that have input but no response and are still loading
						const filteredVersions = dialogue.versions.filter(
							(version) =>
								!(
									version.input &&
									version.response === null &&
									version.isLoading
								),
						);

						// Update activeVersionId if necessary
						let activeVersionId = dialogue.activeVersionId;
						if (
							activeVersionId !== null &&
							!filteredVersions.some((v) => v.id === activeVersionId) &&
							filteredVersions.length > 0
						) {
							// If the active version was removed, set the latest version as active
							activeVersionId =
								filteredVersions[filteredVersions.length - 1]?.id || null;
						} else if (filteredVersions.length === 0) {
							activeVersionId = null;
						}

						return {
							...dialogue,
							versions: filteredVersions,
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

					const dialogue = state.dialogues[dialogueIndex];
					if (!dialogue) return state;

					// Filter out the target version
					const updatedVersions = dialogue.versions.filter(
						(v) => v.id !== versionId,
					);

					// If there are no versions left, don't change the dialogue
					if (updatedVersions.length === 0 && dialogue.versions.length === 1) {
						return state;
					}

					// Update activeVersionId if necessary
					let activeVersionId = dialogue.activeVersionId;
					if (activeVersionId === versionId && updatedVersions.length > 0) {
						// Set the latest version as active if the deleted version was active
						const lastVersion = updatedVersions[updatedVersions.length - 1];
						activeVersionId = lastVersion ? lastVersion.id : null;
					} else if (updatedVersions.length === 0) {
						activeVersionId = null;
					}

					const updatedDialogue = {
						...dialogue,
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
			name: "llm-dialogue-storage",
			partialize: (state) => ({
				dialogues: state.dialogues,
				activeDialogueId: state.activeDialogueId,
				globalSelectedProviderId: state.globalSelectedProviderId,
				globalSelectedModelId: state.globalSelectedModelId,
			}),
		},
	),
);
