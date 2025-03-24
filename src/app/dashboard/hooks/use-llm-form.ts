"use client";

import { getModelPrice } from "@/lib/models";
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
}

export function useLlmForm({
  session,
  isMounted,
  setIsMounted,
  formSchema,
}: UseLlmFormProps) {
  const {
    activeSessionId,
    sessions,
    addVersion,
    setVersionResponse,
    setVersionLoading,
    getPreviousConversation,
    getSelectedModelId,
    setSessionModelId,
  } = useLlmSessionStore();

  // Custom loading state to handle the async submission
  const [isLoading, setIsLoading] = useState(false);

  // Ref to prevent infinite loops in useEffect
  const isUpdatingModelIdRef = useRef<boolean>(false);
  // Ref for previous model ID to detect changes
  const prevModelIdRef = useRef<string | null>(null);
  // Track session changes with a ref
  const prevSessionIdRef = useRef<number>(activeSessionId);
  // Ref to track if initial setup is done
  const initialSetupDoneRef = useRef<boolean>(false);

  const activeSession = sessions.find(
    (session) => session.id === activeSessionId
  );

  // Get the currently selected model for this session
  const selectedModelId = getSelectedModelId(activeSessionId);

  // Check if user has background info from the session data
  const hasBackgroundInfo = Boolean(
    session?.user?.backgroundInfo && session.user.backgroundInfo.trim() !== ""
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
        (session) => session.id === activeSessionId
      );
      if (activeSession?.activeVersionId) {
        setVersionLoading(
          activeSessionId,
          activeSession.activeVersionId,
          false
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
      modelId: selectedModelId || "anthropic/claude-3.7-sonnet", // Default to a known model ID
      withBackgroundInfo: false,
      precisionMode: false,
    },
  });

  const isSubmitting = form.formState.isSubmitting;
  const watchedModelId = form.watch("modelId");

  // Get the price information for the selected model
  const modelPrice = getModelPrice(selectedModelId);

  // Get the current model's price info for the watched model ID
  const currentModelPrice = getModelPrice(watchedModelId);

  // One-time setup of the form after component mounts
  useEffect(() => {
    if (isMounted && !initialSetupDoneRef.current && selectedModelId) {
      initialSetupDoneRef.current = true;

      // Set initial values
      prevModelIdRef.current = selectedModelId;

      // Only set the form value if it's different from the current value
      const currentModelId = form.getValues("modelId");
      if (currentModelId !== selectedModelId) {
        form.setValue("modelId", selectedModelId, { shouldDirty: false });
      }
    }
  }, [isMounted, selectedModelId, form]);

  // Update form when session changes
  useEffect(() => {
    if (isMounted && prevSessionIdRef.current !== activeSessionId) {
      prevSessionIdRef.current = activeSessionId;
      const currentModelId = getSelectedModelId(activeSessionId);
      prevModelIdRef.current = currentModelId;

      form.reset({
        prompt: "",
        modelId: currentModelId,
        withBackgroundInfo: false,
        precisionMode: false,
      });
    }
  }, [activeSessionId, form, getSelectedModelId, isMounted]);

  // Handle model changes from the form to the store
  useEffect(() => {
    if (
      !isMounted ||
      isUpdatingModelIdRef.current ||
      !watchedModelId ||
      !initialSetupDoneRef.current
    )
      return;

    // Only update if the model actually changed AND it's not the initial render
    if (
      prevModelIdRef.current !== null &&
      watchedModelId !== selectedModelId &&
      watchedModelId !== prevModelIdRef.current
    ) {
      isUpdatingModelIdRef.current = true;
      setSessionModelId(activeSessionId, watchedModelId);
      prevModelIdRef.current = watchedModelId;
      isUpdatingModelIdRef.current = false;
    }
  }, [
    watchedModelId,
    activeSessionId,
    selectedModelId,
    setSessionModelId,
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
          modelId: values.modelId,
          withBackgroundInfo: values.withBackgroundInfo && hasBackgroundInfo,
          precisionMode: values.precisionMode,
          ...(previousConversation && { history: [previousConversation] }),
        });

        // Update the version with the API response
        // Store the response data properly structured
        setVersionResponse(activeSessionId, versionId, {
          content: JSON.stringify({
            code: response.code,
            advices: response.advices,
            usage: response.usage,
          }),
          timestamp: Date.now(),
          usage: response.usage,
          advices: response.advices,
        });
      } catch (error) {
        console.error("Error submitting form:", error);
        // Set version as not loading
        const activeSession = sessions.find(
          (session) => session.id === activeSessionId
        );
        if (activeSession?.activeVersionId) {
          setVersionLoading(
            activeSessionId,
            activeSession.activeVersionId,
            false
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

    if (activeVersion.input.modelId) {
      isUpdatingModelIdRef.current = true;
      form.setValue("modelId", activeVersion.input.modelId);
      prevModelIdRef.current = activeVersion.input.modelId;
      isUpdatingModelIdRef.current = false;
    }

    if (activeVersion.input.withBackgroundInfo !== undefined) {
      form.setValue(
        "withBackgroundInfo",
        activeVersion.input.withBackgroundInfo
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
    isSubmitting,
    handleSubmit,
    hasBackgroundInfo,
    isUserLoggedIn,
    taskError,
  };
}
