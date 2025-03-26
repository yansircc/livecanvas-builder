"use client";

import type { ModelList, ModelProvider } from "@/lib/models";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Session } from "next-auth";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLlmSessionStore } from "./llm-session-store";
import { useTaskPolling } from "./use-task-polling";

// Define the form schema type directly in this file
export const formSchema = z.object({
	prompt: z.string().min(1, "Prompt is required"),
	providerId: z.custom<ModelProvider>(),
	modelId: z.string(),
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
		activeSessionId,
		sessions,
		addVersion,
		setVersionResponse,
		setVersionLoading,
		getPreviousConversation,
		getSelectedProvider,
		getSelectedModelId,
		setSessionModel,
	} = useLlmSessionStore();

	// Custom loading state to handle the async submission
	const [isLoading, setIsLoading] = useState(false);

	// Ref to prevent infinite loops in useEffect
	const isUpdatingModelRef = useRef<boolean>(false);
	// Ref for previous provider and model IDs to detect changes
	const prevProviderIdRef = useRef<ModelProvider | null>(null);
	const prevModelIdRef = useRef<string | null>(null);
	// Track session changes with a ref
	const prevSessionIdRef = useRef<number>(activeSessionId);
	// Ref to track if initial setup is done
	const initialSetupDoneRef = useRef<boolean>(false);

	const activeSession = sessions.find(
		(session) => session.id === activeSessionId,
	);

	// Get the currently selected provider and model for this session
	const selectedProviderId = getSelectedProvider(activeSessionId);
	const selectedModelId = getSelectedModelId(activeSessionId);

	// Check if user has background info from the session data
	const hasBackgroundInfo = Boolean(
		session?.user?.backgroundInfo && session.user.backgroundInfo.trim() !== "",
	);

	// Whether user is logged in
	const isUserLoggedIn = Boolean(session?.user);

	// Use the task polling hook
	const {
		isLoading: isTaskLoading,
		error: taskError,
		submitAndPollTask,
	} = useTaskPolling({
		onPollingStarted: () => {
			console.log("Task polling started");
		},
		onError: (error: Error) => {
			console.error("Task polling error:", error);
			// Reset loading state for active version
			const activeSession = sessions.find(
				(session) => session.id === activeSessionId,
			);
			if (activeSession?.activeVersionId) {
				setVersionLoading(
					activeSessionId,
					activeSession.activeVersionId,
					false,
				);
			}
		},
	});

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
			modelId: selectedModelId || "",
			withBackgroundInfo: false,
			precisionMode: false,
		},
	});

	const isSubmitting = form.formState.isSubmitting;
	const watchedModelId = form.watch("modelId");
	const watchedProviderId = form.watch("providerId");

	// Get the current model's price info directly from modelList
	const currentModelPrice = modelList[watchedProviderId]?.find(
		(model) => model.value === watchedModelId,
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

	// Update form when session changes
	useEffect(() => {
		if (isMounted && prevSessionIdRef.current !== activeSessionId) {
			prevSessionIdRef.current = activeSessionId;
			const currentProviderId = getSelectedProvider(activeSessionId);
			const currentModelId = getSelectedModelId(activeSessionId);

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
		activeSessionId,
		form,
		getSelectedProvider,
		getSelectedModelId,
		isMounted,
	]);

	// Handle model changes from the form to the store
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
			setSessionModel(activeSessionId, watchedProviderId, watchedModelId);
			prevProviderIdRef.current = watchedProviderId;
			prevModelIdRef.current = watchedModelId;
			isUpdatingModelRef.current = false;
		}
	}, [
		watchedProviderId,
		watchedModelId,
		activeSessionId,
		selectedProviderId,
		selectedModelId,
		setSessionModel,
		isMounted,
	]);

	async function handleSubmit(values: FormValues) {
		try {
			// Set custom loading state to true
			setIsLoading(true);

			// Get previous conversation if available
			const previousConversation = getPreviousConversation(activeSessionId);

			// Prepare form data with history if available
			const formData = {
				prompt: values.prompt,
				providerId: values.providerId,
				modelId: values.modelId,
				withBackgroundInfo: values.withBackgroundInfo,
				precisionMode: values.precisionMode,
				...(previousConversation && { history: [previousConversation] }),
			};

			// Create a new version with the input and history
			const versionId = addVersion(activeSessionId, formData);

			try {
				// Submit task to the API and poll for results
				const response = await submitAndPollTask({
					prompt: values.prompt,
					providerId: values.providerId,
					modelId: values.modelId,
					withBackgroundInfo: values.withBackgroundInfo && hasBackgroundInfo,
					precisionMode: values.precisionMode,
					...(previousConversation && { history: [previousConversation] }),
				});

				// Ensure usage data is present or create a default
				const usageData = response.usage || {
					promptTokens: 0,
					completionTokens: 0,
					totalTokens: 0,
				};

				// Update the version with the API response
				// Store the response data properly structured
				setVersionResponse(activeSessionId, versionId, {
					content: JSON.stringify({
						code: response.code,
						advices: response.advices,
						usage: usageData,
					}),
					timestamp: Date.now(),
					usage: usageData,
					advices: response.advices,
				});
			} catch (error) {
				console.error("Error submitting form:", error);
				// Set version as not loading
				const activeSession = sessions.find(
					(session) => session.id === activeSessionId,
				);
				if (activeSession?.activeVersionId) {
					setVersionLoading(
						activeSessionId,
						activeSession.activeVersionId,
						false,
					);
				}
			}
		} finally {
			setIsLoading(false);
		}
	}

	// Get the active version if it exists
	const activeVersion = activeSession?.activeVersionId
		? activeSession.versions.find((v) => v.id === activeSession.activeVersionId)
		: null;

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

	return {
		form,
		isLoading: isLoading || isTaskLoading,
		currentModelPrice,
		watchedModelId,
		watchedProviderId,
		isSubmitting,
		handleSubmit,
		hasBackgroundInfo,
		isUserLoggedIn,
		taskError,
	};
}
