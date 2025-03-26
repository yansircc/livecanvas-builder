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
import { Loader2, Send } from "lucide-react";
import type { Session } from "next-auth";
import { useRef, useState } from "react";
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

	const { form, isLoading, isSubmitting, handleSubmit, hasBackgroundInfo } =
		useLlmForm({
			session,
			isMounted,
			setIsMounted,
			formSchema,
			modelList,
		});

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
			<form onSubmit={form.handleSubmit(handleSubmit)} className="w-full py-4">
				<div className="relative mx-auto w-full max-w-xl">
					<div className="relative flex flex-col">
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
													"w-full resize-none rounded-none border-none bg-black/5 px-4 py-3 leading-[1.2] placeholder:text-black/70 focus-visible:ring-0 dark:bg-white/5 dark:text-white dark:placeholder:text-white/70",
													"min-h-[52px]",
												)}
												onKeyDown={handleKeyDown}
												onChange={(e) => {
													field.onChange(e);
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Bottom Toolbar */}
						<div className="h-12 rounded-b-xl bg-black/5 dark:bg-white/5">
							{/* Separate the controls from the ref to allow them to intercept clicks */}
							<div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
								{/* Background Info Toggle */}
								<BackgroundCheckbox
									form={form}
									hasBackgroundInfo={hasBackgroundInfo}
									backgroundInfo={session?.user?.backgroundInfo || ""}
								/>

								{/* Precision Mode Toggle */}
								<PrecisionCheckbox form={form} modelList={modelList} />
							</div>

							<div className="absolute right-3 bottom-3">
								<button
									type="submit"
									disabled={buttonDisabled}
									className={cn(
										"rounded-lg p-2 transition-colors",
										form.watch("prompt") && !buttonDisabled
											? "bg-sky-500/15 text-sky-500"
											: "cursor-pointer bg-black/5 text-black/40 hover:text-black dark:bg-white/5 dark:text-white/40 dark:hover:text-white",
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
				</div>
			</form>
		</Form>
	);
}
