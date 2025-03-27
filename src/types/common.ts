import type { AvailableModelId, AvailableProviderId } from "@/types/model";

/**
 * Token usage information for LLM responses
 */
export interface TokenUsage {
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
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
export interface TaskRequest {
	prompt: string;
	history?: { prompt: string; response?: string }[];
	providerId: AvailableProviderId;
	modelId: AvailableModelId;
	withBackgroundInfo?: boolean;
	precisionMode?: boolean;
	dialogueId: number;
	submissionId: number;
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
 * Submission data structure for dialogue submissions
 */
export interface Submission {
	id: number;
	input: TaskRequest;
	response: PollTaskResult | null;
	isLoading: boolean;
	taskStatus?: TaskStatus;
	taskError?: string;
}

/**
 * Dialogue data structure to represent a conversation
 */
export interface Dialogue {
	id: number;
	submissions: Submission[];
	activeSubmissionId: number | null;
	hasCompletedSubmission?: boolean;
}

/**
 * Response structure for task cancellation
 */
export interface TaskCancellationResponse {
	success: boolean;
	message: string;
}
