"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MODELS, type ModelId } from "@/lib/models";
import { useAppStore } from "@/store/use-app-store";
import { Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface EnhancedFormProps {
	onSubmit: (data: FormValues) => void;
	isLoading: boolean;
	advices: string[];
	onAdviceClick: (advice: string) => void;
	initialMessage?: string;
}

interface FormValues {
	message: string;
	model: ModelId;
	apiKey: string;
	context: string;
}

export function EnhancedForm({
	onSubmit,
	isLoading,
	advices,
	onAdviceClick,
	initialMessage = "",
}: EnhancedFormProps) {
	const { apiKey, model, context, setState } = useAppStore();

	// Initialize form with values from the store
	const form = useForm<FormValues>({
		defaultValues: {
			message: initialMessage,
			model: model || "anthropic/claude-3-7-sonnet",
			apiKey: apiKey || "",
			context: context || "",
		},
	});

	// Update form when store values change
	useEffect(() => {
		if (apiKey !== null) {
			form.setValue("apiKey", apiKey);
		}
		if (model) {
			form.setValue("model", model);
		}
		if (context !== undefined) {
			form.setValue("context", context);
		}
	}, [apiKey, model, context, form]);

	// Update store when form values change
	useEffect(() => {
		const subscription = form.watch((value) => {
			if (value.apiKey !== undefined) {
				setState("apiKey", value.apiKey || null);
			}
			if (value.model !== undefined && value.model !== model) {
				setState("model", value.model);
			}
			if (value.context !== undefined && value.context !== context) {
				setState("context", value.context);
			}
		});
		return () => subscription.unsubscribe();
	}, [form, setState, model, context]);

	// Update message when initialMessage changes
	useEffect(() => {
		if (initialMessage) {
			form.setValue("message", initialMessage);
		}
	}, [initialMessage, form]);

	const handleFormSubmit = form.handleSubmit((data) => {
		onSubmit(data);
		// Reset only the message field after submission
		form.setValue("message", "");
	});

	// Add a method to handle advice clicks directly in the form
	const handleAdviceClickInternal = (advice: string) => {
		const currentMessage = form.getValues("message");
		const newMessage = currentMessage ? `${currentMessage}\n${advice}` : advice;
		form.setValue("message", newMessage, {
			shouldValidate: true,
			shouldDirty: true,
			shouldTouch: true,
		});

		// Also call the external handler if provided
		if (onAdviceClick) {
			onAdviceClick(advice);
		}
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="text-2xl">HTML Generator</CardTitle>
				<CardDescription>
					Generate beautiful HTML with Bootstrap using AI
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="prompt" className="w-full">
					<TabsList className="grid grid-cols-2 mb-4">
						<TabsTrigger value="prompt">Prompt</TabsTrigger>
						<TabsTrigger value="settings">Settings</TabsTrigger>
					</TabsList>

					<Form {...form}>
						<form onSubmit={handleFormSubmit} className="space-y-6">
							<TabsContent value="prompt" className="space-y-6">
								{/* Context Field */}
								<FormField
									control={form.control}
									name="context"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Context (Persisted)</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Enter background information or context that will be used for all generations..."
													className="min-h-[80px] resize-y"
													{...field}
												/>
											</FormControl>
											<FormDescription>
												This context will be saved and used for all future
												generations
											</FormDescription>
										</FormItem>
									)}
								/>

								{/* Prompt Field */}
								<FormField
									control={form.control}
									name="message"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Prompt</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Describe the HTML you want to generate..."
													className="min-h-[150px] resize-y"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								{/* Suggestions */}
								{advices.length > 0 && (
									<div className="space-y-2">
										<h3 className="text-sm font-medium">Suggestions:</h3>
										<div className="flex flex-wrap gap-2">
											{advices.map((advice) => (
												<button
													key={advice}
													type="button"
													onClick={() => handleAdviceClickInternal(advice)}
													className="px-3 py-1.5 text-sm bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-md transition-colors"
												>
													{advice}
												</button>
											))}
										</div>
									</div>
								)}

								<Button
									type="submit"
									className="w-full"
									size="lg"
									disabled={isLoading}
								>
									{isLoading ? (
										<span className="flex items-center gap-2">
											<span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
											Generating...
										</span>
									) : (
										<span className="flex items-center gap-2">
											<Sparkles className="h-4 w-4" />
											Generate HTML
										</span>
									)}
								</Button>
							</TabsContent>

							<TabsContent value="settings" className="space-y-6">
								{/* API Key Field */}
								<FormField
									control={form.control}
									name="apiKey"
									render={({ field }) => (
										<FormItem>
											<FormLabel>OpenRouter API Key</FormLabel>
											<FormControl>
												<Input
													type="password"
													placeholder="Enter your OpenRouter API key..."
													{...field}
												/>
											</FormControl>
											<FormDescription>
												Your API key will be saved for future use
											</FormDescription>
										</FormItem>
									)}
								/>

								{/* Model Selection */}
								<FormField
									control={form.control}
									name="model"
									render={({ field }) => (
										<FormItem>
											<FormLabel>AI Model</FormLabel>
											<Select
												value={field.value}
												onValueChange={field.onChange}
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
											<FormDescription>
												Select the AI model to use for generation
											</FormDescription>
										</FormItem>
									)}
								/>
							</TabsContent>
						</form>
					</Form>
				</Tabs>
			</CardContent>
		</Card>
	);
}
