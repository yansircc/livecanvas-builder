import type { GetState, SetState } from "../types";
import { createDialogueActions } from "./dialogue-actions";
import { createGetterActions } from "./getter-actions";
import { createModelActions } from "./model-actions";
import { createStateActions } from "./state-actions";
import { createSubmissionActions } from "./submission-actions";

export function createActions(set: SetState, get: GetState) {
	return {
		...createDialogueActions(set, get),
		...createGetterActions(get),
		...createModelActions(set, get),
		...createStateActions(set, get),
		...createSubmissionActions(set, get),
	};
}

export type DialogueActions = ReturnType<typeof createActions>;
