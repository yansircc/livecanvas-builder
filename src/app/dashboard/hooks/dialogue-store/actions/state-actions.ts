import type { Dialogue, PersistedSubmission } from "@/types/common";
import type { DialogueState, GetState, SetState } from "../types";

export const createStateActions = (set: SetState, get: GetState) => ({
	setActiveDialogueId: (dialogueId: number) => {
		set((state: DialogueState) => ({
			activeDialogueId: dialogueId,
		}));
	},

	setActiveSubmissionId: (dialogueId: number, submissionId: number) => {
		set((state: DialogueState) => ({
			dialogues: state.dialogues.map((dialogue) =>
				dialogue.id === dialogueId
					? ({ ...dialogue, activeSubmissionId: submissionId } as Dialogue)
					: dialogue,
			),
		}));
	},

	setSubmissionResponse: (
		dialogueId: number,
		submissionId: number,
		response: PersistedSubmission["response"],
	) => {
		set((state: DialogueState) => ({
			dialogues: state.dialogues.map((dialogue) =>
				dialogue.id === dialogueId
					? ({
							...dialogue,
							submissions: dialogue.submissions.map((submission) =>
								submission.id === submissionId
									? ({ ...submission, response } as PersistedSubmission)
									: submission,
							),
						} as Dialogue)
					: dialogue,
			),
		}));
	},

	setSubmissionTaskStatus: (
		dialogueId: number,
		submissionId: number,
		taskStatus: PersistedSubmission["taskStatus"],
		taskError?: string,
	) => {
		set((state: DialogueState) => ({
			dialogues: state.dialogues.map((dialogue) =>
				dialogue.id === dialogueId
					? ({
							...dialogue,
							submissions: dialogue.submissions.map((submission) =>
								submission.id === submissionId
									? ({
											...submission,
											taskStatus,
											taskError,
										} as PersistedSubmission)
									: submission,
							),
						} as Dialogue)
					: dialogue,
			),
		}));
	},

	setSubmissionError: (
		dialogueId: number,
		submissionId: number,
		error: string | undefined,
	) => {
		set((state: DialogueState) => ({
			dialogues: state.dialogues.map((dialogue) =>
				dialogue.id === dialogueId
					? ({
							...dialogue,
							submissions: dialogue.submissions.map((submission) =>
								submission.id === submissionId
									? ({ ...submission, taskError: error } as PersistedSubmission)
									: submission,
							),
						} as Dialogue)
					: dialogue,
			),
		}));
	},
});
