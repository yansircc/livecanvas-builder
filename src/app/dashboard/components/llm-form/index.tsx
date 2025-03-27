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
import type { Session } from "next-auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type * as z from "zod";
import { formSchema, useDialogueStore, useLlmForm } from "../../hooks";
import { BackgroundCheckbox } from "./background-checkbox";
import { ModelSelector } from "./model-selector";
import { PrecisionCheckbox } from "./precision-checkbox";
import { TaskActionButton } from "./task-action-button";

export type FormValues = z.infer<typeof formSchema>;

interface LlmFormProps {
	session: Session | null;
	modelList: ModelList;
}

export function LlmForm({ session, modelList }: LlmFormProps) {
	// State to track if component is mounted (to avoid hydration mismatch)
	const [isMounted, setIsMounted] = useState(false);
	// 本地状态来跟踪是否正在取消
	const [isCanceling, setIsCanceling] = useState(false);

	const {
		form,
		isLoading,
		isSubmitting,
		handleSubmit,
		hasBackgroundInfo,
		extraPromptCost,
		taskStatus,
		taskId,
		cancelTask,
	} = useLlmForm({
		session,
		isMounted,
		setIsMounted,
		formSchema,
		modelList,
	});

	// 获取当前活动的dialogue ID和version
	const activeDialogueId = useDialogueStore((state) => state.activeDialogueId);
	const activeVersion = useDialogueStore((state) => state.getActiveVersion());

	// Show toast notifications for task status changes
	useEffect(() => {
		if (!isMounted || !taskStatus) return;

		switch (taskStatus) {
			case "COMPLETED":
				toast.success("任务已完成");
				break;
			case "FAILED":
				toast.error("任务失败");
				break;
			case "CRASHED":
				toast.error("任务崩溃");
				break;
			case "SYSTEM_FAILURE":
				toast.error("系统错误");
				break;
			case "INTERRUPTED":
				toast.error("任务中断");
				break;
			case "CANCELED":
				toast.error("任务已被取消");
				break;
			// 默认不显示 toast
		}
	}, [taskStatus, isMounted]);

	// 扩展FormValues类型以包含dialogueId
	type ExtendedFormValues = FormValues & { dialogueId: number };

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			form.handleSubmit((values: FormValues) =>
				handleSubmit({
					...values,
					dialogueId: activeDialogueId,
				} as ExtendedFormValues),
			)();
		}
	};

	// 是否有内容可提交
	const hasContent = !!form.watch("prompt");

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit((values: FormValues) =>
					handleSubmit({
						...values,
						dialogueId: activeDialogueId,
					} as ExtendedFormValues),
				)}
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
											disabled={isLoading || isSubmitting}
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
								extraPromptCost={
									extraPromptCost ? Number(extraPromptCost.cny.toFixed(2)) : 0
								}
							/>
						</div>

						{/* 任务操作按钮 */}
						<TaskActionButton
							isLoading={isLoading}
							isSubmitting={isSubmitting}
							taskId={taskId}
							taskStatus={taskStatus}
							cancelTask={async (id) => {
								if (activeVersion) {
									return await cancelTask(
										id,
										activeDialogueId,
										activeVersion.id,
									);
								}
								return false;
							}}
							hasContent={hasContent}
							onCancelingChange={setIsCanceling}
						/>
					</div>
				</div>

				{/* 底部状态提示文本 */}
				{isLoading && taskId && (
					<div className="mt-1 text-center">
						<span className="text-xs text-zinc-500 dark:text-zinc-400">
							{isCanceling ? "正在取消任务..." : "AI正在努力思考..."}
						</span>
					</div>
				)}
			</form>
		</Form>
	);
}
