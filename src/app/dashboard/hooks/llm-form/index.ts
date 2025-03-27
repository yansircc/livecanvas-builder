import type { ModelList } from "@/lib/models";
import type { Version } from "@/types/common";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Session } from "next-auth";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAdviceStore } from "../advice-store";
import { useDialogueStore } from "../dialogue-store";
import { useTaskPolling } from "../task-polling-store";
import { type FormValues, formSchema } from "./schema";
import { useAdviceHandler } from "./use-advice-handler";
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

	const {
		activeDialogueId,
		getActiveDialogue,
		getActiveVersion,
		addVersion,
		setVersionResponse,
		setVersionLoading,
		getPreviousDialogue,
		getSelectedProvider,
		getSelectedModelId,
		setGlobalModel,
		markDialogueCompleted,
	} = useDialogueStore();

	const setHandleAdviceClick = useAdviceStore(
		(state) => state.setHandleAdviceClick,
	);

	// Use the task polling hook
	const { taskId, submitAndPollTask, cancelTask } = useTaskPolling();

	// Get current dialogue loading state
	const activeDialogue = getActiveDialogue();
	const isLoading =
		activeDialogue?.versions.some((v: Version) => v.isLoading) || false;

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
	const activeVersion = getActiveVersion();
	const taskStatus = activeVersion?.taskStatus ?? null;

	// Reset version loading state helper function
	const resetVersionLoadingState = useCallback(() => {
		if (activeDialogue?.activeVersionId) {
			setVersionLoading(
				activeDialogueId,
				activeDialogue.activeVersionId,
				false,
			);
		}
	}, [activeDialogue, activeDialogueId, setVersionLoading]);

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

	// Use advice handler hook
	const { handleAdviceClick } = useAdviceHandler(form, setHandleAdviceClick);

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
		addVersion,
		getPreviousDialogue,
		markDialogueCompleted,
		resetVersionLoadingState,
		setVersionResponse,
		submitAndPollTask,
	});

	return {
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
		activeVersion,
		onSubmit: handleSubmit,
		handleCancelTask: cancelTask,
	};
}
