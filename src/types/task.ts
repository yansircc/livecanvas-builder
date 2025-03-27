import type { AvailableModelId, AvailableProviderId } from "./model";

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
 * Dialogue history for conversation context
 */
export interface DialogueHistory {
	prompt: string;
	response: string;
}

/**
 * Common parameters for LLM task requests
 */
export interface TaskRequest {
	prompt: string;
	history?: DialogueHistory[];
	providerId: AvailableProviderId;
	modelId: AvailableModelId;
	withBackgroundInfo?: boolean;
	precisionMode?: boolean;
	dialogueId: number;
	submissionId: number;
}

/**
 * Token usage information for LLM responses
 */
export interface TokenUsage {
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
}

/**
 * Standard result structure from LLM task completion
 */
export interface PollTaskResult {
	taskId: string;
	code: string;
	advices: string[];
	usage?: TokenUsage;
	status: TaskStatus;
	error?: string;
}

/**
 * Response structure for task cancellation
 */
export interface TaskCancellationResponse {
	success: boolean;
	message: string;
}
