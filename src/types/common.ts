import type { AvailableModelId, AvailableProviderId } from "@/lib/models";

/**
 * Token usage information for LLM responses
 */
export interface TokenUsage {
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
}

/**
 * Cost calculation for prompt tokens
 */
export interface ExtraPromptCost {
	tokens: number;
	usd: number;
	cny: number;
}

/**
 * Dialogue history for conversation context
 */
export interface DialogueHistory {
	prompt: string;
	response: string;
}

/**
 * Task statuses aligned with backend service status codes
 */
export type TaskStatus =
	| "COMPLETED"
	| "CANCELED"
	| "FAILED"
	| "CRASHED"
	| "SYSTEM_FAILURE"
	| "INTERRUPTED"
	| "EXECUTING"
	| "WAITING"
	| "PENDING"
	| "RUNNING";

/**
 * Common parameters for LLM task requests
 */
export interface TaskParams {
	prompt: string;
	history?: { prompt: string; response?: string }[];
	providerId?: AvailableProviderId;
	modelId?: AvailableModelId;
	withBackgroundInfo?: boolean;
	precisionMode?: boolean;
	dialogueId: number;
	versionId: number;
}

/**
 * Standard result structure from LLM task completion
 */
export interface TaskResult {
	taskId: string;
	code: string;
	advices: string[];
	usage?: TokenUsage;
	status: TaskStatus;
	error?: string;
}

/**
 * Response structure from task status endpoints
 */
export interface TaskStatusResponse {
	taskId: string;
	status: TaskStatus;
	output: unknown;
	error:
		| {
				message: string;
				name?: string;
				stackTrace?: string;
		  }
		| string
		| undefined;
	startedAt: string | undefined;
	completedAt: string | undefined;
	originalStatus: string;
}

/**
 * Common structure for LLM responses
 */
export interface LlmResponse {
	content: string;
	timestamp: number;
	usage?: TokenUsage;
	advices?: string[];
}

/**
 * Form data structure for LLM requests
 */
export interface FormData {
	prompt: string;
	history?: DialogueHistory[];
	providerId?: AvailableProviderId;
	modelId?: AvailableModelId;
	withBackgroundInfo?: boolean;
	precisionMode?: boolean;
}

/**
 * Version data structure for dialogue versions
 */
export interface Version {
	id: number;
	input: FormData;
	response: LlmResponse | null;
	isLoading: boolean;
	taskStatus?: TaskStatus;
	taskError?: string;
}

/**
 * Dialogue data structure to represent a conversation
 */
export interface Dialogue {
	id: number;
	versions: Version[];
	activeVersionId: number | null;
	hasCompletedVersion?: boolean;
}
