"use client";

import { AdviceList } from "@/components/canvas/advice-list";
import { CodeOutput } from "@/components/canvas/code-output";
import { ModelSelector } from "@/components/canvas/model-selector";
import { PromptInput } from "@/components/canvas/prompt-input";
import { SettingsDialog } from "@/components/settings-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import type { ModelId } from "@/lib/models";
import { useAppStore } from "@/store/use-app-store";
import { processHtml } from "@/utils/process-html";
import "@/styles/bootstrap-preview.css";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Code2, Loader2 } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { type CodeResponse, codeSchema } from "./api/chat/schema";

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
	} = useAppStore();

	const form = useForm<FormValues>({
		defaultValues: {
			message: "",
			model,
		},
	});

	// Render template to HTML using Mustache
	const renderTemplateToHtml = useCallback(
		(htmlCode: string) => {
			try {
				// Process HTML to replace Lucide icons with SVGs where possible
				try {
					const processedHtmlWithIcons = processHtml(htmlCode);
					setProcessedHtml(processedHtmlWithIcons);
				} catch (iconError) {
					console.error("Error processing icons:", iconError);
					setProcessedHtml(htmlCode);
				}

				setValidationResult({
					valid: true,
					errors: [],
				});

				if (processedHtml) {
					openPreview(processedHtml);
				}
			} catch (error) {
				console.error("Error displaying HTML:", error);
				setProcessedHtml(`
				<div class="bg-red-100 text-red-800 p-4 rounded-md border border-red-300">
					<h3 class="font-semibold text-lg mb-2">Display Error</h3>
					<p>Unable to display the HTML code: ${
						error instanceof Error ? error.message : "Unknown error"
					}</p>
				</div>
			`);
				setValidationResult({
					valid: false,
					errors: [
						`Failed to display HTML: ${
							error instanceof Error ? error.message : "Unknown error"
						}`,
					],
				});
			}
		},
		[setProcessedHtml, setValidationResult, processedHtml],
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
					setCode(object.code);
					setAdvices(
						object.advices?.filter((advice): advice is string => !!advice) ||
							[],
					);

					// Convert EJS to HTML and process
					renderTemplateToHtml(object.code);
				}
			} else if (error) {
				console.log("Schema validation error:", error);
				toast.error("An error occurred during generation");
			}
		},
		onError(error) {
			setIsLoading(false);
			console.error("An error occurred:", error);
			toast.error("An error occurred while connecting to the API");
		},
	});

	// Update state as the stream comes in
	useEffect(() => {
		if (object?.code) {
			setCode(object.code);
			setAdvices(
				object.advices?.filter((advice): advice is string => !!advice) || [],
			);

			// Only update the code display, don't render until finished
			// renderTemplateToHtml(object.code);
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
		setProcessedHtml(`
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
		`);

		submit({
			message: data.message,
			apiKey: apiKey || undefined,
			model: data.model,
		});
	});

	const handleAdviceClick = (advice: string) => {
		const currentMessage = form.getValues("message");
		form.setValue(
			"message",
			currentMessage ? `${currentMessage}\n${advice}` : advice,
		);
	};

	return (
		<main className="container mx-auto p-4 md:p-8">
			<div className="flex items-center justify-between mb-8">
				<h1 className="text-3xl font-bold">Canvas Builder</h1>
				<div className="flex items-center gap-2">
					<SettingsDialog />
					<ThemeToggle />
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Input Section */}
				<section className="space-y-6">
					<div className="rounded-lg border bg-card text-card-foreground shadow">
						<div className="p-6 space-y-4">
							<h2 className="text-2xl font-semibold">Configuration</h2>

							<Form {...form}>
								<form onSubmit={handleSubmit} className="space-y-4">
									<ModelSelector control={form.control} />
									<PromptInput control={form.control} />

									<Button type="submit" className="w-full" disabled={isLoading}>
										{isLoading ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Generating...
											</>
										) : (
											<>
												<Code2 className="mr-2 h-4 w-4" />
												Generate Code
											</>
										)}
									</Button>
								</form>
							</Form>
						</div>
					</div>

					<AdviceList advices={advices} onAdviceClick={handleAdviceClick} />
				</section>

				{/* Output Section */}
				<section className="space-y-6">
					<CodeOutput code={code} validationResult={validationResult} />
				</section>
			</div>
		</main>
	);
}
