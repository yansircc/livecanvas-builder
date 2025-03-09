"use client";

import { codeSchema } from "@/app/api/chat/schema";
import { CodeOutput } from "@/components/canvas/code-output";
import { EnhancedForm } from "@/components/canvas/enhanced-form";
import { MAX_CONTEXT_LENGTH } from "@/components/canvas/enhanced-form";
import { ThemeToggle } from "@/components/theme-toggle";
import type { ModelId } from "@/lib/models";
import { useAppStore } from "@/store/use-app-store";
import { processHtml } from "@/utils/process-html";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface CodeResponse {
	code: string;
	advices?: string[] | null;
}

interface FormValues {
	message: string;
	model: ModelId;
	apiKey: string;
	context: string;
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
		context,
		isLoading,
		code,
		advices,
		processedHtml,
		validationResult,
		versions,
		currentVersionIndex,
		setState,
		addVersion,
		switchToVersion,
		resetState,
	} = useAppStore();

	// Add a state variable to store the current message
	const [currentMessage, setCurrentMessage] = useState("");

	// Clear version history when the page loads
	useEffect(() => {
		resetState({ keepUserSettings: true, keepVersions: false });
	}, [resetState]);

	// Add a debug log to check if the persistence is working
	useEffect(() => {
		console.log("Stored values:", { apiKey, model, context });
	}, [apiKey, model, context]);

	// Render template to HTML
	const renderTemplateToHtml = useCallback(
		(htmlCode: string) => {
			try {
				// Process HTML to replace Lucide icons with SVGs where possible
				try {
					const processedHtmlWithIcons = processHtml(htmlCode);
					setState("processedHtml", processedHtmlWithIcons);
					return processedHtmlWithIcons;
				} catch (iconError) {
					console.error("Error processing icons:", iconError);
					setState("processedHtml", htmlCode);
					return htmlCode;
				}
			} catch (error) {
				console.error("Error displaying HTML:", error);
				setState("validationResult", {
					valid: false,
					errors: ["Failed to process HTML"],
				});
				return null;
			}
		},
		[setState],
	);

	const { object, submit } = useObject<CodeResponse>({
		schema: codeSchema,
		api: "/api/chat",
		onFinish({ object, error }) {
			setState("isLoading", false);
			if (object) {
				console.log("Object generation completed:", object);

				// Process the code once generation is complete
				if (object.code) {
					setState("code", object.code);

					// Handle advices with robust type checking and conversion
					if (object.advices) {
						let processedAdvices: string[] = [];
						if (Array.isArray(object.advices)) {
							processedAdvices = object.advices.map((advice) =>
								typeof advice === "string" ? advice : String(advice),
							);
						} else if (typeof object.advices === "string") {
							try {
								const parsed = JSON.parse(object.advices);
								processedAdvices = Array.isArray(parsed)
									? parsed.map((item) => String(item))
									: [object.advices];
							} catch (e) {
								processedAdvices = [object.advices];
							}
						}

						setState("advices", processedAdvices);
					} else {
						setState("advices", []);
					}

					// Process the HTML
					const processedHtml = renderTemplateToHtml(object.code);

					// Add a new version with the current form data
					const formData = {
						message: currentMessage,
						model: model,
						apiKey: apiKey,
						context: context,
					};

					// If we're not at the latest version, we need to handle version history differently
					if (
						currentVersionIndex >= 0 &&
						currentVersionIndex < versions.length - 1
					) {
						// Instead of modifying versions directly, we'll handle this in the addVersion function
						// The addVersion function will take care of truncating the versions array
					}

					addVersion(currentMessage, formData);

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
			setState("isLoading", false);
			console.error("API error:", error);
			toast.error(
				error?.message || "An error occurred while generating the template",
			);
		},
	});

	// Update state as the stream comes in
	useEffect(() => {
		if (object?.code) {
			setState("code", object.code);

			// Add robust type checking and conversion for advices
			if (object.advices) {
				let processedAdvices: string[] = [];

				if (Array.isArray(object.advices)) {
					// If it's already an array, filter out non-string values
					processedAdvices = object.advices.filter(
						(advice): advice is string =>
							typeof advice === "string" && !!advice,
					);
				} else if (typeof object.advices === "string") {
					// If it's a string, try to parse it as JSON
					try {
						const parsed = JSON.parse(object.advices);
						if (Array.isArray(parsed)) {
							processedAdvices = parsed.filter(
								(item): item is string => typeof item === "string" && !!item,
							);
						} else if (typeof parsed === "string") {
							// If parsed result is a string, use it as a single advice
							processedAdvices = [parsed];
						}
					} catch (e) {
						// If parsing fails, use the string as a single advice
						processedAdvices = [object.advices];
					}
				}

				setState("advices", processedAdvices);
			} else {
				setState("advices", []);
			}
		}
	}, [object, setState]);

	const handleSubmit = (data: FormValues) => {
		// Context Optimization:
		// Instead of sending the entire conversation history, we only send:
		// 1. The most recent AI response (from the current version)
		// 2. The current user message
		// This significantly reduces token usage while maintaining enough context
		// for the AI to generate a coherent response.

		if (!data.message.trim()) {
			toast.error("Please enter a prompt");
			return;
		}

		if (data.context && data.context.length > MAX_CONTEXT_LENGTH) {
			toast.error(`Context must be ${MAX_CONTEXT_LENGTH} characters or less`);
			return;
		}

		// Store the current message for later use
		setCurrentMessage(data.message);

		resetState({ keepUserSettings: true, keepVersions: true });
		setState("isLoading", true);

		// Build conversation history based on the current version
		const conversationHistory = [];

		// If we're on a specific version, get only the most recent AI response
		if (currentVersionIndex >= 0 && versions.length > 0) {
			// Get the current version (most recent AI response)
			const currentVersion = versions[currentVersionIndex];

			// Only add the most recent AI response to the history
			if (currentVersion) {
				conversationHistory.push({
					prompt: currentVersion.prompt,
					response: currentVersion.code,
				});
			}

			// Log the optimized context for debugging
			console.log(
				"Optimized context: Only sending the most recent AI response",
			);
		}

		submit({
			message: data.message,
			context: (data.context || context || "").substring(0, 1200),
			history: conversationHistory,
			apiKey: data.apiKey || apiKey || undefined,
			model: data.model || model,
		});
	};

	const handleAdviceClick = (advice: string) => {
		// This is now just a placeholder since the form handles it internally
		console.log("Advice clicked:", advice);
	};

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Header */}
			<header className="border-b bg-card">
				<div className="container py-4 flex items-center justify-between mx-auto">
					<h1 className="text-2xl font-bold text-primary">
						LiveCanvas Builder
					</h1>
					<div className="flex items-center gap-4">
						<ThemeToggle />
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="flex-1 py-6">
				<div className="container h-full mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
						{/* Left: Form Panel */}
						<div>
							<EnhancedForm
								onSubmit={handleSubmit}
								isLoading={isLoading}
								advices={advices}
								onAdviceClick={handleAdviceClick}
								initialMessage={currentMessage}
							/>
						</div>

						{/* Right: Output Panel */}
						<div className="h-full">
							<CodeOutput
								code={code || ""}
								validationResult={validationResult}
							/>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
