"use client";

import type {
	AvailableModelId,
	AvailableProviderId,
	ModelList,
} from "@/lib/models";
import type { TaskStatus } from "@/types/task";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Session } from "next-auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { calculateExtraPromptCost } from "../utils/calculate-cost";
import { useLlmSessionStore } from "./llm-session-store";
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
		activeSessionId,
		sessions,
		addVersion,
		setVersionResponse,
		setVersionLoading,
		getPreviousConversation,
		getSelectedProvider,
		getSelectedModelId,
		setGlobalModel,
	} = useLlmSessionStore();

	const setHandleAdviceClick = useAdviceStore(
		(state) => state.setHandleAdviceClick,
	);

	// 修改：使用Map来存储每个session的loading状态
	const [sessionLoadingStates, setSessionLoadingStates] = useState<
		Map<number, boolean>
	>(new Map());

	// 获取当前session的loading状态
	const isLoading = sessionLoadingStates.get(activeSessionId) || false;

	// 设置特定session的loading状态
	const setSessionLoading = useCallback(
		(sessionId: number, loading: boolean) => {
			setSessionLoadingStates((prev) => {
				const newMap = new Map(prev);
				newMap.set(sessionId, loading);
				return newMap;
			});
		},
		[],
	);

	// Ref to prevent infinite loops in useEffect
	const isUpdatingModelRef = useRef<boolean>(false);
	// Ref for previous provider and model IDs to detect changes
	const prevProviderIdRef = useRef<AvailableProviderId | null>(null);
	const prevModelIdRef = useRef<AvailableModelId | null>(null);
	// Track session changes with a ref
	const prevSessionIdRef = useRef<number>(activeSessionId);
	// Ref to track if initial setup is done
	const initialSetupDoneRef = useRef<boolean>(false);

	const activeSession = sessions.find(
		(session) => session.id === activeSessionId,
	);

	// Get the currently selected provider and model
	const selectedProviderId = getSelectedProvider();
	const selectedModelId = getSelectedModelId();

	// Check if user has background info from the session data
	const hasBackgroundInfo = Boolean(
		session?.user?.backgroundInfo && session.user.backgroundInfo.trim() !== "",
	);

	// Whether user is logged in
	const isUserLoggedIn = Boolean(session?.user);

	const [taskCompleted, setTaskCompleted] = useState(false);

	// 添加额外的状态变量来更明确地跟踪任务状态
	const [currentTaskStatus, setCurrentTaskStatus] = useState<
		TaskStatus | undefined
	>(undefined);

	// Use the task polling hook
	const { getSessionTaskState, taskId, submitAndPollTask, cancelTask } =
		useTaskPolling();

	// 获取当前session的任务状态
	const currentSessionState = getSessionTaskState(activeSessionId);
	const taskStatus = currentSessionState.status;
	const taskError = currentSessionState.error;

	// 重置版本加载状态的辅助函数
	const resetVersionLoadingState = () => {
		const activeSession = sessions.find(
			(session) => session.id === activeSessionId,
		);
		if (activeSession?.activeVersionId) {
			setVersionLoading(activeSessionId, activeSession.activeVersionId, false);
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

	// Update form when session changes
	useEffect(() => {
		if (isMounted && prevSessionIdRef.current !== activeSessionId) {
			prevSessionIdRef.current = activeSessionId;
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
		activeSessionId,
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

	// 添加一个 effect 来监视 pollingStatus
	useEffect(() => {
		if (taskStatus) {
			setCurrentTaskStatus(taskStatus);
		}
	}, [taskStatus]);

	async function handleSubmit(values: FormValues & { sessionId: number }) {
		try {
			// 设置当前session的loading状态
			setSessionLoading(values.sessionId, true);

			// Get previous conversation if available
			const previousConversation = getPreviousConversation(values.sessionId);

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
			const versionId = addVersion(values.sessionId, formData);

			try {
				// Submit task to the API and poll for results
				const response = await submitAndPollTask({
					...formData,
					sessionId: values.sessionId,
					withBackgroundInfo: values.withBackgroundInfo && hasBackgroundInfo,
				});

				// Ensure usage data is present or create a default
				const usageData = response.usage || {
					promptTokens: 0,
					completionTokens: 0,
					totalTokens: 0,
				};

				// Update the version with the API response
				setVersionResponse(values.sessionId, versionId, {
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
				resetVersionLoadingState();
			}
		} finally {
			setSessionLoading(values.sessionId, false);
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
