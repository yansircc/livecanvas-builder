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
import { MODELS } from "@/lib/models";
import { Loader2 } from "lucide-react";
import type { Session } from "next-auth";
import { useState } from "react";
import type * as z from "zod";
import { formSchema, useLlmForm } from "../../hooks/use-llm-form";

export type FormValues = z.infer<typeof formSchema>;

interface LlmFormProps {
	session: Session | null;
}

export function LlmFormComponent({ session }: LlmFormProps) {
	// State to track if component is mounted (to avoid hydration mismatch)
	const [isMounted, setIsMounted] = useState(false);

	const {
		form,
		isLoading,
		currentModelPrice,
		isSubmitting,
		handleSubmit,
		hasBackgroundInfo,
		isUserLoggedIn,
	} = useLlmForm({
		session,
		isMounted,
		setIsMounted,
		formSchema,
	});

	// Use either our custom loading state or the form's built-in state
	const buttonDisabled = isLoading || isSubmitting;

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
											<SelectValue placeholder="选择模型" />
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
									输入: ${currentModelPrice.input.toFixed(3)}/M tokens | 输出: $
									{currentModelPrice.output.toFixed(3)}/M tokens
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
