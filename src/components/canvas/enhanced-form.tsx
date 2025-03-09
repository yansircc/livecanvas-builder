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

export const MAX_CONTEXT_LENGTH = 3000;

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
		<div className="w-full border p-8 rounded-lg">
			<Tabs defaultValue="prompt" className="w-full">
				<TabsList className="grid grid-cols-2 mb-4">
					<TabsTrigger value="prompt">提示词</TabsTrigger>
					<TabsTrigger value="settings">设置</TabsTrigger>
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
										<FormLabel>背景信息</FormLabel>
										<FormControl>
											<div className="relative">
												<Textarea
													placeholder="输入背景信息或上下文，用于所有生成..."
													className="min-h-[80px] resize-y"
													maxLength={MAX_CONTEXT_LENGTH}
													{...field}
													onChange={(e) => {
														if (e.target.value.length <= MAX_CONTEXT_LENGTH) {
															field.onChange(e);
														}
													}}
												/>
												<div
													className={`absolute bottom-2 right-2 text-xs ${
														(field.value?.length || 0) > MAX_CONTEXT_LENGTH
															? "text-destructive font-medium"
															: "text-muted-foreground"
													}`}
												>
													{field.value?.length || 0}/{MAX_CONTEXT_LENGTH}
												</div>
											</div>
										</FormControl>
										<FormDescription>
											这个背景信息将被保存并在所有未来的生成中使用（最多{" "}
											{MAX_CONTEXT_LENGTH} 个字符）
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
										<FormLabel>提示词</FormLabel>
										<FormControl>
											<Textarea
												placeholder="描述你想要生成的HTML..."
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
									<h3 className="text-sm font-medium">建议:</h3>
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
										生成中...
									</span>
								) : (
									<span className="flex items-center gap-2">
										<Sparkles className="h-4 w-4" />
										生成HTML
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
										<FormLabel>OpenRouter API秘钥</FormLabel>
										<FormControl>
											<Input
												type="password"
												placeholder="输入你的OpenRouter API秘钥..."
												{...field}
											/>
										</FormControl>
										<FormDescription>
											你的API秘钥将被保存用于未来的使用
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
										<FormLabel>AI模型</FormLabel>
										<Select value={field.value} onValueChange={field.onChange}>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="选择一个模型" />
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
										<FormDescription>选择用于生成的AI模型</FormDescription>
									</FormItem>
								)}
							/>
						</TabsContent>
					</form>
				</Form>
			</Tabs>
		</div>
	);
}
