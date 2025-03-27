import type { Dialogue, PersistedSubmission } from "@/types/common";
import type { AvailableModelId, AvailableProviderId } from "@/types/model";
import type {
	DialogueHistory,
	PollTaskResult,
	TaskRequest,
	TaskStatus,
} from "@/types/task";
import type { StateCreator, StoreApi } from "zustand";

export interface DialogueState {
	dialogues: Dialogue[];
	activeDialogueId: number;
	defaultProviderId: AvailableProviderId;
	defaultModelId: AvailableModelId;

	// Getters
	getActiveDialogue: () => Dialogue | undefined;
	getActiveSubmission: () => PersistedSubmission | undefined;
	getDialogueSubmission: (
		dialogueId: number,
		submissionId: number,
	) => PersistedSubmission | undefined;
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
	setDialogueSelectedModel: (
		dialogueId: number,
		providerId: AvailableProviderId,
		modelId: AvailableModelId,
	) => void;
}

export type DialogueStateCreator = StateCreator<
	DialogueState,
	[],
	[],
	DialogueState
>;
export type SetState = StoreApi<DialogueState>["setState"];
export type GetState = () => DialogueState;
