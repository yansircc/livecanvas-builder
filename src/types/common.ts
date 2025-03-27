import type { AvailableModelId, AvailableProviderId } from "./model";
import type { PollTaskResult, TaskRequest, TaskStatus } from "./task";
/**
 * PersistedSubmission data structure for dialogue submissions
 */
export interface PersistedSubmission {
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
	submissions: PersistedSubmission[];
	activeSubmissionId: number | null;
	hasCompletedSubmission?: boolean;
	selectedProviderId?: AvailableProviderId;
	selectedModelId?: AvailableModelId;
}
