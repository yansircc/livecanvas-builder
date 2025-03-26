"use client";

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { ModelList } from "@/lib/models";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types/task";
import { Loader2, Send } from "lucide-react";
import type { Session } from "next-auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type * as z from "zod";
import { formSchema, useLlmForm } from "../hooks/use-llm-form";
import { BackgroundCheckbox } from "./background-checkbox";
import { ModelSelector } from "./model-selector";
import { PrecisionCheckbox } from "./precision-checkbox";

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
		extraPromptCost,
		taskStatus,
		taskError,
	} = useLlmForm({
		session,
		isMounted,
		setIsMounted,
		formSchema,
		modelList,
	});

	// 添加额外调试日志
	useEffect(() => {
		if (isMounted && (taskStatus || taskError)) {
			console.log("Form state updated:", {
				taskStatus,
				hasError: !!taskError,
			});
		}
	}, [isMounted, taskStatus, taskError]);

	// Show toast notifications for task status changes
	useEffect(() => {
		if (!isMounted || !taskStatus) return;

		switch (taskStatus) {
			case "COMPLETED":
				toast.success("任务已完成");
				break;
			case "FAILED":
				toast.error(`任务失败${taskError ? `: ${taskError.message}` : ""}`);
				break;
			case "CRASHED":
				toast.error(`任务崩溃${taskError ? `: ${taskError.message}` : ""}`);
				break;
			case "SYSTEM_FAILURE":
				toast.error(`系统错误${taskError ? `: ${taskError.message}` : ""}`);
				break;
			case "INTERRUPTED":
				toast.error(`任务中断${taskError ? `: ${taskError.message}` : ""}`);
				break;
			case "CANCELED":
				toast.error("任务已被取消");
				break;
			// 默认不显示 toast
		}
	}, [taskStatus, taskError, isMounted]);

	// Use either our custom loading state or the form's built-in state
	const buttonDisabled = isLoading || isSubmitting;

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			form.handleSubmit(handleSubmit)();
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="relative mx-auto w-full"
			>
				<div className="relative flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800">
					{/* Model Selector Component */}
					<ModelSelector
						form={form}
						modelList={modelList}
						isMounted={isMounted}
					/>

					{/* Textarea Input Section */}
					<div className="max-h-[200px] overflow-y-auto">
						<FormField
							control={form.control}
							name="prompt"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Textarea
											{...field}
											placeholder="输入你的提示词，例如：生成一个简单的按钮..."
											className={cn(
												"w-full resize-none rounded-none border-none bg-zinc-50 px-5 py-4 leading-relaxed placeholder:text-zinc-400 focus-visible:ring-0 dark:bg-zinc-900 dark:text-zinc-200 dark:placeholder:text-zinc-600",
												"min-h-[80px] transition-all duration-150",
											)}
											onKeyDown={handleKeyDown}
											onChange={(e) => {
												field.onChange(e);
											}}
										/>
									</FormControl>
									<FormMessage className="px-4 text-xs" />
								</FormItem>
							)}
						/>
					</div>

					{/* Bottom Toolbar */}
					<div className="h-14 rounded-b-xl bg-zinc-50 transition-colors duration-150 dark:bg-zinc-900">
						{/* Separate the controls from the ref to allow them to intercept clicks */}
						<div className="absolute bottom-4 left-4 z-10 flex items-center gap-3">
							{/* Background Info Toggle */}
							<BackgroundCheckbox
								form={form}
								hasBackgroundInfo={hasBackgroundInfo}
								backgroundInfo={session?.user?.backgroundInfo || ""}
							/>

							{/* Precision Mode Toggle */}
							<PrecisionCheckbox
								form={form}
								extraPromptCost={Number(extraPromptCost?.cny.toFixed(2)) || 0}
							/>
						</div>

						<div className="absolute right-4 bottom-4">
							<button
								type="submit"
								disabled={buttonDisabled}
								className={cn(
									"rounded-md p-2.5 transition-colors duration-150",
									form.watch("prompt") && !buttonDisabled
										? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
										: "cursor-pointer bg-zinc-100 text-zinc-400 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-700",
								)}
							>
								{buttonDisabled ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Send className="h-4 w-4" />
								)}
							</button>
						</div>
					</div>
				</div>
			</form>
		</Form>
	);
}
