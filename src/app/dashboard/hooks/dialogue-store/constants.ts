import type { Dialogue } from "@/types/common";
import type { AvailableModelId, AvailableProviderId } from "@/types/model";

// Default provider and model values
export const defaultProviderId: AvailableProviderId = "anthropic";
export const defaultModelId: AvailableModelId = "claude-3-7-sonnet-20250219";

// Initial dialogue
export const defaultDialogue: Dialogue = {
	id: 1,
	submissions: [],
	activeSubmissionId: null,
	selectedProviderId: defaultProviderId,
	selectedModelId: defaultModelId,
};
