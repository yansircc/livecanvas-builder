import type { TokenUsage } from "@/types/task";
import type { GetState } from "../types";

export const createGetterActions = (get: GetState) => ({
	getActiveDialogue: () => {
		const state = get();
		return state.dialogues.find((s) => s.id === state.activeDialogueId);
	},

	getActiveSubmission: () => {
		const state = get();
		const activeDialogue = state.dialogues.find(
			(s) => s.id === state.activeDialogueId,
		);
		if (!activeDialogue || !activeDialogue.activeSubmissionId) return undefined;

		return activeDialogue.submissions.find(
			(v) => v.id === activeDialogue.activeSubmissionId,
		);
	},

	getDialogueSubmission: (dialogueId: number, submissionId: number) => {
		const dialogue = get().dialogues.find((s) => s.id === dialogueId);
		return dialogue?.submissions.find((v) => v.id === submissionId);
	},

	getPreviousDialogue: (dialogueId: number) => {
		const state = get();
		const dialogue = state.dialogues.find((s) => s.id === dialogueId);

		if (!dialogue || dialogue.submissions.length === 0) {
			return null;
		}

		// Get the last submission that has a response
		const submissionsWithResponses = dialogue.submissions
			.filter((v) => v.response !== null)
			.sort((a, b) => b.id - a.id);

		if (submissionsWithResponses.length === 0) {
			return null;
		}

		const lastSubmission = submissionsWithResponses[0];

		if (!lastSubmission || !lastSubmission.response) {
			return null;
		}

		// Try to parse the content as JSON to extract the code
		let responseContent: {
			code: string;
			advices?: string[];
			usage?: TokenUsage;
		};

		try {
			responseContent = JSON.parse(lastSubmission.response.code);
		} catch (error) {
			// If parsing fails, use the content directly
			responseContent = {
				code: lastSubmission.response.code,
			};
		}

		return {
			prompt: lastSubmission.input.prompt,
			response: responseContent.code,
		};
	},
});
