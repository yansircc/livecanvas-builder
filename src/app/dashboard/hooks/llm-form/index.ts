import type { PersistedSubmission } from "@/types/common";
import type { ModelList } from "@/types/model";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Session } from "next-auth";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useDialogueStore } from "../dialogue-store";
import type { DialogueState } from "../dialogue-store/types";
import { useTaskPolling } from "../task-polling-store";
import { type FormValues, formSchema } from "./schema";
import { useCostCalculation } from "./use-cost-calculation";
import { useFormInitialization } from "./use-form-initialization";
import { useFormSubmission } from "./use-form-submission";
import { useModelSync } from "./use-model-sync";

export { formSchema, type FormValues } from "./schema";

interface UseLlmFormProps {
	session: Session | null;
	isMounted: boolean;
	setIsMounted: (value: boolean) => void;
	formSchema?: typeof formSchema;
	modelList: ModelList;
}

export function useLlmForm({
	session,
	isMounted,
	setIsMounted,
	formSchema: formSchemaProp,
	modelList,
}: UseLlmFormProps) {
	// Set component as mounted after initial render
	useEffect(() => {
		setIsMounted(true);
	}, [setIsMounted]);

	// Use stable selectors to prevent infinite render loops
	const activeDialogueId = useDialogueStore(
		useCallback((state: DialogueState) => state.activeDialogueId, []),
	);

	const getActiveDialogue = useDialogueStore(
		useCallback((state: DialogueState) => state.getActiveDialogue, []),
	);

	const getActiveSubmission = useDialogueStore(
		useCallback((state: DialogueState) => state.getActiveSubmission, []),
	);

	const addSubmission = useDialogueStore(
		useCallback((state: DialogueState) => state.addSubmission, []),
	);

	const setSubmissionResponse = useDialogueStore(
		useCallback((state: DialogueState) => state.setSubmissionResponse, []),
	);

	const setSubmissionLoading = useDialogueStore(
		useCallback((state: DialogueState) => state.setSubmissionLoading, []),
	);

	const getPreviousDialogue = useDialogueStore(
		useCallback((state: DialogueState) => state.getPreviousDialogue, []),
	);

	const getSelectedProvider = useDialogueStore(
		useCallback((state: DialogueState) => state.getSelectedProvider, []),
	);

	const getSelectedModelId = useDialogueStore(
		useCallback((state: DialogueState) => state.getSelectedModelId, []),
	);

	const setGlobalModel = useDialogueStore(
		useCallback((state: DialogueState) => state.setGlobalModel, []),
	);

	const markDialogueCompleted = useDialogueStore(
		useCallback((state: DialogueState) => state.markDialogueCompleted, []),
	);

	// Use the task polling hook
	const { taskId, submitAndPollTask, cancelTask } = useTaskPolling();

	// Get current dialogue loading state
	const activeDialogue = getActiveDialogue();
	const isLoading = useMemo(() => {
		return Boolean(
			activeDialogue?.submissions.some((v: PersistedSubmission) => v.isLoading),
		);
	}, [activeDialogue]);

	// Get the currently selected provider and model
	const selectedProviderId = getSelectedProvider();
	const selectedModelId = getSelectedModelId();

	// Check if user has background info from the dialogue data
	const hasBackgroundInfo = Boolean(
		session?.user?.backgroundInfo &&
			session?.user?.backgroundInfo.trim() !== "",
	);

	// Whether user is logged in
	const isUserLoggedIn = Boolean(session?.user);

	// Get current dialogue task status
	const activeSubmission = getActiveSubmission();
	const taskStatus = activeSubmission?.taskStatus ?? null;

	// Reset submission loading state helper function
	const resetSubmissionLoadingState = useCallback(() => {
		if (activeDialogue?.activeSubmissionId) {
			setSubmissionLoading(
				activeDialogueId,
				activeDialogue.activeSubmissionId,
				false,
			);
		}
	}, [activeDialogue, activeDialogueId, setSubmissionLoading]);

	// Initialize form with default values
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchemaProp || formSchema),
		defaultValues: {
			prompt: "",
			providerId: selectedProviderId || "anthropic",
			modelId: selectedModelId,
			withBackgroundInfo: false,
			precisionMode: false,
		},
	});

	// Use form initialization hook
	const {
		isUpdatingModelRef,
		prevProviderIdRef,
		prevModelIdRef,
		initialSetupDoneRef,
	} = useFormInitialization(
		form,
		isMounted,
		selectedProviderId,
		selectedModelId,
		activeDialogueId,
		getSelectedProvider,
		getSelectedModelId,
	);

	// Watch form values
	const isSubmitting = form.formState.isSubmitting;
	const watchedModelId = form.watch("modelId");
	const watchedProviderId = form.watch("providerId");
	const promptValue = form.watch("prompt");

	// Use cost calculation hook
	const { extraPromptCost, currentModelPrice } = useCostCalculation(
		promptValue,
		watchedProviderId,
		watchedModelId,
		modelList,
	);

	// Use model sync hook
	useModelSync(
		watchedProviderId,
		watchedModelId,
		selectedProviderId,
		selectedModelId,
		isMounted,
		isUpdatingModelRef,
		prevProviderIdRef,
		prevModelIdRef,
		initialSetupDoneRef,
		setGlobalModel,
	);

	// Use form submission hook
	const { handleSubmit } = useFormSubmission({
		activeDialogueId,
		activeDialogue,
		addSubmission,
		getPreviousDialogue,
		markDialogueCompleted,
		resetSubmissionLoadingState,
		setSubmissionResponse,
		submitAndPollTask,
	});

	// Return a stable object reference using useMemo
	return useMemo(
		() => ({
			form,
			isLoading,
			isSubmitting,
			handleSubmit,
			hasBackgroundInfo,
			extraPromptCost,
			taskStatus,
			taskId,
			cancelTask,
			isUserLoggedIn,
			currentModelPrice,
			activeSubmission,
			onSubmit: handleSubmit,
			handleCancelTask: cancelTask,
		}),
		[
			form,
			isLoading,
			isSubmitting,
			handleSubmit,
			hasBackgroundInfo,
			extraPromptCost,
			taskStatus,
			taskId,
			cancelTask,
			isUserLoggedIn,
			currentModelPrice,
			activeSubmission,
		],
	);
}
