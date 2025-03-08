"use client";

import { codeSchema } from "@/app/api/chat/schema";
import { CodeOutput } from "@/components/canvas/code-output";
import { ModelSelector } from "@/components/canvas/model-selector";
import { PromptInput } from "@/components/canvas/prompt-input";
import { VersionHistory } from "@/components/canvas/version-history";
import { SettingsDialog } from "@/components/settings-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form-simple";
import type { ModelId } from "@/lib/models";
import { useAppStore } from "@/store/use-app-store";
import { processHtml } from "@/utils/process-html";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface CodeResponse {
	code: string;
	advices?: string[];
}

interface FormValues {
	message: string;
	model: ModelId;
}

function openPreview(html: string) {
	const contentId = Date.now().toString();
	localStorage.setItem(`preview_content_${contentId}`, html);
	window.open(`/preview?id=${contentId}`, "_blank");
}

export default function Page() {
	const {
		apiKey,
		model,
		setModel,
		isLoading,
		setIsLoading,
		code,
		setCode,
		advices,
		setAdvices,
		processedHtml,
		setProcessedHtml,
		validationResult,
		setValidationResult,
		resetResults,
		addVersion,
		currentVersionIndex,
		versions,
		setVersions,
		clearVersions,
	} = useAppStore();

	// Clear version history when the page loads
	useEffect(() => {
		clearVersions();
	}, [clearVersions]);

	const form = useForm<FormValues>({
		defaultValues: {
			message: "",
			model,
		},
	});

	// Render template to HTML
	const renderTemplateToHtml = useCallback(
		(htmlCode: string) => {
			try {
				// Process HTML to replace Lucide icons with SVGs where possible
				try {
					const processedHtmlWithIcons = processHtml(htmlCode);
					setProcessedHtml(processedHtmlWithIcons);
					return processedHtmlWithIcons;
				} catch (iconError) {
					console.error("Error processing icons:", iconError);
					setProcessedHtml(htmlCode);
					return htmlCode;
				}
			} catch (error) {
				console.error("Error displaying HTML:", error);
				setValidationResult({
					valid: false,
					errors: ["Failed to process HTML"],
				});
				return null;
			}
		},
		[setProcessedHtml, setValidationResult],
	);

	const { object, submit } = useObject<CodeResponse>({
		schema: codeSchema,
		api: "/api/chat",
		onFinish({ object, error }) {
			setIsLoading(false);
			if (object) {
				console.log("Object generation completed:", object);

				// Process the code once generation is complete
				if (object.code) {
					// Convert to HTML and process
					const processedHtml = renderTemplateToHtml(object.code);

					// Add to version history, but first truncate any versions after the current one
					const prompt = form.getValues("message");

					// If creating a new version from a previous version, remove all versions after it
					if (
						currentVersionIndex >= 0 &&
						currentVersionIndex < versions.length - 1
					) {
						// Keep versions up to and including currentVersionIndex
						setVersions(versions.slice(0, currentVersionIndex + 1));
					}

					// Now add the new version (addVersion function will set parent ID)
					addVersion(prompt);

					// Reset form after successful generation
					form.reset({ message: "", model: form.getValues("model") });

					// Open preview with the current version's HTML
					if (processedHtml) {
						openPreview(processedHtml);
					}
				}
			} else if (error) {
				console.log("Schema validation error:", error);
				toast.error("An error occurred during generation");
			}
		},
		onError(error) {
			setIsLoading(false);
			console.error("API error:", error);
			toast.error(
				error?.message || "An error occurred while generating the template",
			);
		},
	});

	// Update state as the stream comes in
	useEffect(() => {
		if (object?.code) {
			setCode(object.code);
			if (object.advices) {
				const filteredAdvices = object.advices.filter(
					(advice): advice is string => !!advice,
				);
				setAdvices(filteredAdvices);
			}

			// We don't render HTML or create versions until streaming is complete
		}
	}, [object, setCode, setAdvices]);

	const handleSubmit = form.handleSubmit((data) => {
		if (!data.message.trim()) {
			toast.error("Please enter a prompt");
			return;
		}

		resetResults();
		setIsLoading(true);
		setModel(data.model);

		// Display loading message in the rendered output
		const loadingHtml = `
			<div class="flex items-center justify-center p-8 text-gray-500">
				<div class="text-center">
					<div class="inline-block mb-4">
						<svg class="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
					</div>
					<p class="text-lg font-medium">Generating template...</p>
					<p class="text-sm mt-2">Please wait while we create your content</p>
				</div>
			</div>
		`;
		setProcessedHtml(loadingHtml);

		// Build conversation history based on the current version
		const conversationHistory = [];

		// If we're on a specific version, build history from its ancestors
		if (currentVersionIndex >= 0 && versions.length > 0) {
			// First, create a map of versions by ID for easy lookup
			const versionsMap = new Map();
			for (const version of versions) {
				versionsMap.set(version.id, version);
			}

			// Start with the current version
			let version = versions[currentVersionIndex];

			// Traverse the parent chain to build history in chronological order
			const historyStack = [];
			while (version) {
				historyStack.unshift({
					prompt: version.prompt,
					response: version.code,
				});

				// Move to parent version if it exists
				version = version.parentId ? versionsMap.get(version.parentId) : null;
			}

			// Add all history items except the current version (we're modifying it)
			if (historyStack.length > 0) {
				conversationHistory.push(...historyStack);
			}
		}

		submit({
			message: data.message,
			history: conversationHistory,
			apiKey: apiKey || undefined,
			model: data.model,
		});
	});

	const handleAdviceClick = (advice: string) => {
		const currentMessage = form.getValues("message");
		const newMessage = currentMessage
			? `${currentMessage}\n${advice}` // Add on new line if there's existing content
			: advice; // Use advice directly if empty
		form.setValue("message", newMessage);
	};

	return (
		<div className="container mx-auto py-8 space-y-8">
			<header className="flex justify-between items-center">
				<h1 className="text-3xl font-bold">Canvas Builder</h1>
				<div className="flex items-center gap-4">
					<ThemeToggle />
					<SettingsDialog />
				</div>
			</header>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="md:col-span-2 space-y-6">
					<Form {...form}>
						<form onSubmit={handleSubmit} className="space-y-4">
							<PromptInput
								control={form.control}
								isLoading={isLoading}
								advices={advices}
								onAdviceClick={handleAdviceClick}
							/>
							<div className="flex justify-between items-center">
								<ModelSelector control={form.control} />
								<Button type="submit" disabled={isLoading}>
									{isLoading ? "Generating..." : "Generate"}
								</Button>
							</div>
						</form>
					</Form>

					<section className="space-y-6">
						<CodeOutput code={code || ""} validationResult={validationResult} />
					</section>
				</div>

				<div className="space-y-6">
					<VersionHistory />
				</div>
			</div>
		</div>
	);
}
