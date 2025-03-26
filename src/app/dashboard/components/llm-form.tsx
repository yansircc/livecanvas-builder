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
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ModelList, ModelProvider } from "@/lib/models";
import { Loader2 } from "lucide-react";
import type { Session } from "next-auth";
import { useState } from "react";
import type * as z from "zod";
import { formSchema, useLlmForm } from "../hooks/use-llm-form";

export type FormValues = z.infer<typeof formSchema>;

interface LlmFormProps {
	session: Session | null;
	modelList: ModelList;
}

export function LlmForm({ session, modelList }: LlmFormProps) {
	// State to track if component is mounted (to avoid hydration mismatch)
	const [isMounted, setIsMounted] = useState(false);

	const {
		form,
		isLoading,
		isSubmitting,
		handleSubmit,
		hasBackgroundInfo,
		isUserLoggedIn,
	} = useLlmForm({
		session,
		isMounted,
		setIsMounted,
		formSchema,
		modelList,
	});

	// Use either our custom loading state or the form's built-in state
	const buttonDisabled = isLoading || isSubmitting;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="providerId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>服务商</FormLabel>
							{isMounted ? (
								<Select
									onValueChange={(value: ModelProvider) => {
										field.onChange(value);
										// Get the first model of the new provider
										const firstModel = modelList[value][0];
										if (firstModel) {
											form.setValue("modelId", firstModel.value);
										}
									}}
									value={field.value}
									defaultValue="anthropic"
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="选择服务商" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{Object.entries(modelList).map(([provider, _]) => (
											<SelectItem key={provider} value={provider}>
												{provider.toUpperCase()}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							) : (
								<div className="h-10 w-full rounded-md border border-input bg-background" />
							)}
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="modelId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>模型</FormLabel>
							{isMounted ? (
								<Select
									onValueChange={field.onChange}
									value={field.value}
									disabled={!form.getValues("providerId")}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="选择模型" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{(() => {
											const provider = form.getValues(
												"providerId",
											) as ModelProvider;
											return provider
												? modelList[provider].map((model) => (
														<SelectItem key={model.value} value={model.value}>
															{model.name}
														</SelectItem>
													))
												: null;
										})()}
									</SelectContent>
								</Select>
							) : (
								<div className="h-10 w-full rounded-md border border-input bg-background" />
							)}
							{isMounted && (
								<FormDescription>
									{(() => {
										const provider = form.getValues(
											"providerId",
										) as ModelProvider;
										const modelId = field.value;
										if (provider && modelId) {
											const model = modelList[provider].find(
												(m) => m.value === modelId,
											);
											if (model) {
												return `输入: $${model.price.input.toFixed(2)}/M tokens | 输出: $${model.price.output.toFixed(2)}/M tokens`;
											}
										}
										return null;
									})()}
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
							<FormLabel>提示词</FormLabel>
							<FormControl>
								<Textarea
									placeholder="生成一个简单的按钮..."
									className="min-h-32 resize-none"
									{...field}
								/>
							</FormControl>
							<FormDescription>
								输入你的提示词，例如：生成一个简单的按钮...
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
								<FormLabel>理解背景</FormLabel>
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
								<FormLabel>精准模式</FormLabel>
							</FormItem>
						)}
					/>
				</div>

				<Button type="submit" className="w-full" disabled={buttonDisabled}>
					{buttonDisabled && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					提交
				</Button>
			</form>
		</Form>
	);
}
