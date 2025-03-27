"use client";

import type {
	AvailableModelId,
	AvailableProviderId,
	ModelList,
} from "@/lib/models";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Session } from "next-auth";
import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { calculateExtraPromptCost } from "../utils/calculate-cost";
import { useLlmDialogueStore } from "./llm-dialogue-store";
import { useAdviceStore } from "./use-advice-store";
import { useTaskPolling } from "./use-task-polling";

// Define the form schema type directly in this file
export const formSchema = z.object({
	prompt: z.string().min(1, "Prompt is required"),
	providerId: z.custom<AvailableProviderId>(),
	modelId: z.custom<AvailableModelId>(),
	withBackgroundInfo: z.boolean().default(false),
	precisionMode: z.boolean().default(false),
});

export type FormValues = z.infer<typeof formSchema>;

interface UseLlmFormProps {
	session: Session | null;
	isMounted: boolean;
	setIsMounted: (value: boolean) => void;
	formSchema: typeof formSchema;
	modelList: ModelList;
}

export function useLlmForm({
	session,
	isMounted,
	setIsMounted,
	formSchema,
	modelList,
}: UseLlmFormProps) {
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
	} = useLlmDialogueStore();

	const setHandleAdviceClick = useAdviceStore(
		(state) => state.setHandleAdviceClick,
	);

	// Use the task polling hook
	const { getDialogueTaskState, taskId, submitAndPollTask, cancelTask } =
		useTaskPolling();

	// 获取当前dialogue的loading状态
	const activeDialogue = getActiveDialogue();
	const isLoading = activeDialogue?.versions.some((v) => v.isLoading) || false;

	// Ref to prevent infinite loops in useEffect
	const isUpdatingModelRef = useRef<boolean>(false);
	// Ref for previous provider and model IDs to detect changes
	const prevProviderIdRef = useRef<AvailableProviderId | null>(null);
	const prevModelIdRef = useRef<AvailableModelId | null>(null);
	// Track dialogue changes with a ref
	const prevDialogueIdRef = useRef<number>(activeDialogueId);
	// Ref to track if initial setup is done
	const initialSetupDoneRef = useRef<boolean>(false);

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

	// 获取当前dialogue的任务状态
	const activeVersion = getActiveVersion();
	const taskStatus = activeVersion?.taskStatus ?? null;
	const taskError = activeVersion?.taskError ?? null;

	// 重置版本加载状态的辅助函数
	const resetVersionLoadingState = () => {
		if (activeDialogue?.activeVersionId) {
			setVersionLoading(
				activeDialogueId,
				activeDialogue.activeVersionId,
				false,
			);
		}
	};

	// Add useEffect to set isMounted to true after component mounts
	useEffect(() => {
		setIsMounted(true);

		// Cleanup function to handle component unmount
		return () => {
			initialSetupDoneRef.current = false;
		};
	}, [setIsMounted]);

	// Initialize form with default values
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			prompt: "",
			providerId: selectedProviderId || "anthropic",
			modelId: selectedModelId,
			withBackgroundInfo: false,
			precisionMode: false,
		},
	});

	// Add a function to handle advice clicks
	const handleAdviceClick = useCallback(
		(advice: string) => {
			const currentPrompt = form.getValues("prompt");
			const newPrompt = `${currentPrompt}\n${advice}`;
			form.setValue("prompt", newPrompt);
		},
		[form.getValues, form.setValue],
	);

	// Register the handler in the store
	useEffect(() => {
		setHandleAdviceClick(handleAdviceClick);
		return () => {
			setHandleAdviceClick(() => {});
		};
	}, [handleAdviceClick, setHandleAdviceClick]);

	const isSubmitting = form.formState.isSubmitting;
	const watchedModelId = form.watch("modelId");
	const watchedProviderId = form.watch("providerId");

	// Get the current model's price info directly from modelList
	const currentModelPrice = modelList[watchedProviderId]?.find(
		(model) => model.id === watchedModelId,
	)?.price;

	// One-time setup of the form after component mounts
	useEffect(() => {
		if (
			isMounted &&
			!initialSetupDoneRef.current &&
			selectedProviderId &&
			selectedModelId
		) {
			initialSetupDoneRef.current = true;

			// Set initial values
			prevProviderIdRef.current = selectedProviderId;
			prevModelIdRef.current = selectedModelId;

			// Only set the form values if they're different from the current values
			const currentProviderId = form.getValues("providerId");
			const currentModelId = form.getValues("modelId");

			if (currentProviderId !== selectedProviderId) {
				form.setValue("providerId", selectedProviderId, { shouldDirty: false });
			}

			if (currentModelId !== selectedModelId) {
				form.setValue("modelId", selectedModelId, { shouldDirty: false });
			}
		}
	}, [isMounted, selectedProviderId, selectedModelId, form]);

	// Update form when dialogue changes
	useEffect(() => {
		if (isMounted && prevDialogueIdRef.current !== activeDialogueId) {
			prevDialogueIdRef.current = activeDialogueId;
			const currentProviderId = getSelectedProvider();
			const currentModelId = getSelectedModelId();

			prevProviderIdRef.current = currentProviderId;
			prevModelIdRef.current = currentModelId;

			form.reset({
				prompt: "",
				providerId: currentProviderId,
				modelId: currentModelId,
				withBackgroundInfo: false,
				precisionMode: false,
			});
		}
	}, [
		activeDialogueId,
		form,
		getSelectedProvider,
		getSelectedModelId,
		isMounted,
	]);

	// Handle model changes from the form to the global store
	useEffect(() => {
		if (
			!isMounted ||
			isUpdatingModelRef.current ||
			!watchedProviderId ||
			!watchedModelId ||
			!initialSetupDoneRef.current
		)
			return;

		// Only update if the provider or model actually changed AND it's not the initial render
		const providerChanged =
			prevProviderIdRef.current !== null &&
			watchedProviderId !== selectedProviderId &&
			watchedProviderId !== prevProviderIdRef.current;

		const modelChanged =
			prevModelIdRef.current !== null &&
			watchedModelId !== selectedModelId &&
			watchedModelId !== prevModelIdRef.current;

		if (providerChanged || modelChanged) {
			isUpdatingModelRef.current = true;
			setGlobalModel(watchedProviderId, watchedModelId);
			prevProviderIdRef.current = watchedProviderId;
			prevModelIdRef.current = watchedModelId;
			isUpdatingModelRef.current = false;
		}
	}, [
		watchedProviderId,
		watchedModelId,
		selectedProviderId,
		selectedModelId,
		setGlobalModel,
		isMounted,
	]);

	async function handleSubmit(values: FormValues & { dialogueId: number }) {
		try {
			// Get previous dialogue if available
			const previousDialogue = getPreviousDialogue(values.dialogueId);

			// Prepare form data with history if available
			const formData = {
				prompt: values.prompt,
				providerId: values.providerId,
				modelId: values.modelId,
				withBackgroundInfo: values.withBackgroundInfo,
				precisionMode: values.precisionMode,
				...(previousDialogue && { history: [previousDialogue] }),
			};

			// Create a new version with the input and history
			const versionId = addVersion(values.dialogueId, formData);

			try {
				// Submit task to the API and poll for results
				const response = await submitAndPollTask({
					...formData,
					dialogueId: values.dialogueId,
					versionId,
					withBackgroundInfo: values.withBackgroundInfo && hasBackgroundInfo,
				});

				// Ensure usage data is present or create a default
				const usageData = response.usage || {
					promptTokens: 0,
					completionTokens: 0,
					totalTokens: 0,
				};

				// Update the version with the API response
				setVersionResponse(values.dialogueId, versionId, {
					content: JSON.stringify({
						code: response.code,
						advices: response.advices,
						usage: usageData,
					}),
					timestamp: Date.now(),
					usage: usageData,
					advices: response.advices,
				});

				// 任务成功完成时标记dialogue
				if (response.status === "COMPLETED") {
					markDialogueCompleted(values.dialogueId);
				}
			} catch (error) {
				console.error("Error submitting form:", error);
				resetVersionLoadingState();
			}
		} finally {
			if (activeDialogue?.activeVersionId) {
				setVersionLoading(
					values.dialogueId,
					activeDialogue.activeVersionId,
					false,
				);
			}
		}
	}

	// Use the active version's input if it exists and we're not submitting
	useEffect(() => {
		if (!isMounted || isSubmitting || !activeVersion) return;

		form.setValue("prompt", activeVersion.input.prompt);

		if (activeVersion.input.providerId) {
			isUpdatingModelRef.current = true;
			form.setValue("providerId", activeVersion.input.providerId);
			prevProviderIdRef.current = activeVersion.input.providerId;
			isUpdatingModelRef.current = false;
		}

		if (activeVersion.input.modelId) {
			isUpdatingModelRef.current = true;
			form.setValue("modelId", activeVersion.input.modelId);
			prevModelIdRef.current = activeVersion.input.modelId;
			isUpdatingModelRef.current = false;
		}

		if (activeVersion.input.withBackgroundInfo !== undefined) {
			form.setValue(
				"withBackgroundInfo",
				activeVersion.input.withBackgroundInfo,
			);
		}

		if (activeVersion.input.precisionMode !== undefined) {
			form.setValue("precisionMode", activeVersion.input.precisionMode);
		}
	}, [activeVersion, form, isSubmitting, isMounted]);

	const extraPromptCost = calculateExtraPromptCost(
		13000,
		modelList,
		selectedProviderId,
		selectedModelId,
	);

	return {
		form,
		isLoading,
		currentModelPrice,
		watchedModelId,
		watchedProviderId,
		isSubmitting,
		handleSubmit,
		hasBackgroundInfo,
		isUserLoggedIn,
		taskError,
		handleAdviceClick,
		extraPromptCost,
		taskStatus,
		taskId,
		cancelTask,
	};
}
