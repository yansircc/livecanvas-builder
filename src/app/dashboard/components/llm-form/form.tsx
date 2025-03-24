"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MODELS, getModelPrice } from "@/lib/models";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import type { Session } from "next-auth";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { getLlmResponse } from "../../mock-data";
import { useLlmSessionStore } from "../../store/llm-session-store";

const formSchema = z.object({
	prompt: z.string().min(1, "Prompt is required"),
	modelId: z.string(),
	withBackgroundInfo: z.boolean().default(false),
	precisionMode: z.boolean().default(false),
});

export type FormValues = z.infer<typeof formSchema>;

interface LlmFormProps {
	session: Session | null;
}

export function LlmFormComponent({ session }: LlmFormProps) {
	// State to track if component is mounted (to avoid hydration mismatch)
	const [isMounted, setIsMounted] = useState(false);

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
		(session) => session.id === activeSessionId,
	);

	// Get the currently selected model for this session
	const selectedModelId = getSelectedModelId(activeSessionId);

	// Check if user has background info from the session data
	const hasBackgroundInfo = Boolean(
		session?.user?.backgroundInfo && session.user.backgroundInfo.trim() !== "",
	);

	// Whether user is logged in
	const isUserLoggedIn = Boolean(session?.user);

	// Add useEffect to set isMounted to true after component mounts
	useEffect(() => {
		setIsMounted(true);

		// Cleanup function to handle component unmount
		return () => {
			initialSetupDoneRef.current = false;
		};
	}, []);

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

	async function onSubmit(values: FormValues) {
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

			// Get the response, including history if available
			const response = await getLlmResponse(
				values.prompt,
				previousConversation || undefined,
				values.modelId,
				values.withBackgroundInfo,
				values.precisionMode,
			);

			// Update the version with the response
			setVersionResponse(activeSessionId, versionId, {
				content: JSON.stringify(response),
				timestamp: Date.now(),
				usage: response.usage,
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
				activeVersion.input.withBackgroundInfo,
			);
		}

		if (activeVersion.input.precisionMode !== undefined) {
			form.setValue("precisionMode", activeVersion.input.precisionMode);
		}
	}, [activeVersion, form, isSubmitting, isMounted]);

	// Use either our custom loading state or the form's built-in state
	const buttonDisabled = isLoading || isSubmitting;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="modelId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Model</FormLabel>
							{isMounted ? (
								<Select
									onValueChange={(value) => {
										if (value !== field.value) {
											field.onChange(value);
										}
									}}
									value={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select a model" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{MODELS.map((model) => (
											<SelectItem key={model.id} value={model.id}>
												{model.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							) : (
								<div className="h-10 w-full rounded-md border border-input bg-background" />
							)}
							{isMounted && currentModelPrice && (
								<FormDescription>
									Input: ${currentModelPrice.input.toFixed(3)}/M tokens |
									Output: ${currentModelPrice.output.toFixed(3)}/M tokens
								</FormDescription>
							)}
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="prompt"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Prompt</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Enter your prompt here..."
									className="min-h-32 resize-none"
									{...field}
								/>
							</FormControl>
							<FormDescription>
								Type your message for the AI assistant
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="flex flex-col gap-4 sm:flex-row">
					<FormField
						control={form.control}
						name="withBackgroundInfo"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
										disabled={!isUserLoggedIn || !hasBackgroundInfo}
									/>
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel>Use Background Info</FormLabel>
									<FormDescription>
										{!isUserLoggedIn
											? "Sign in to use background information"
											: hasBackgroundInfo
												? "Include your profile background information"
												: "No background information available in your profile"}
									</FormDescription>
								</div>
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="precisionMode"
						render={({ field }) => (
							<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={field.onChange}
									/>
								</FormControl>
								<div className="space-y-1 leading-none">
									<FormLabel>Precision Mode</FormLabel>
									<FormDescription>
										Enable higher accuracy with increased token usage
									</FormDescription>
								</div>
							</FormItem>
						)}
					/>
				</div>

				<Button type="submit" className="w-full" disabled={buttonDisabled}>
					{buttonDisabled && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Submit
				</Button>
			</form>
		</Form>
	);
}
