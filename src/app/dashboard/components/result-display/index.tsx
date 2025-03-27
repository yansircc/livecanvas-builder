"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Submission } from "@/types/common";
import type { ModelList } from "@/types/model";
import { CodeIcon } from "lucide-react";
import { useAdviceStore, useDialogueStore } from "../../hooks";
import { AdviceList } from "./advice-list";
import { CopyButton } from "./copy-button";
import { PreviewButton } from "./preview-button";
import ShowCost from "./show-cost";
import { SubmissionSelector } from "./submission-selector";

interface ResultDisplayProps {
	modelList: ModelList;
}

export default function ResultDisplay({ modelList }: ResultDisplayProps) {
	const { dialogues, activeDialogueId } = useDialogueStore();
	const handleAdviceClick = useAdviceStore((state) => state.handleAdviceClick);

	const activeDialogue = dialogues.find(
		(dialogue) => dialogue.id === activeDialogueId,
	);

	if (!activeDialogue) {
		return <EmptyState />;
	}

	const activeSubmission = activeDialogue.activeSubmissionId
		? activeDialogue.submissions.find(
				(v: Submission) => v.id === activeDialogue.activeSubmissionId,
			)
		: null;

	if (!activeSubmission) {
		return <EmptyState />;
	}

	if (activeSubmission.isLoading) {
		return <LoadingState />;
	}

	if (!activeSubmission.response) {
		return <EmptyState />;
	}

	const responseData = activeSubmission.response;
	const codeContent = responseData.code || "";

	// If no code, show an empty code state
	if (!codeContent) {
		return (
			<Card className="h-full border border-zinc-200 dark:border-zinc-800">
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="font-medium text-lg text-zinc-800 dark:text-zinc-200">
						AI 响应
					</CardTitle>
					{activeDialogue.submissions.length > 0 && <SubmissionSelector />}
				</CardHeader>
				<CardContent className="flex h-full items-center justify-center p-8">
					<p className="text-zinc-500 dark:text-zinc-400">没有代码</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="h-full border border-zinc-200 shadow-none dark:border-zinc-800">
			<CardHeader className="flex flex-row items-center justify-between border-zinc-200 border-b pb-3 dark:border-zinc-800">
				<CardTitle className="flex items-center font-medium text-lg text-zinc-800 dark:text-zinc-200">
					{activeDialogue.submissions.length <= 1 && "代码"}
					{activeDialogue.submissions.length > 1 && <SubmissionSelector />}
				</CardTitle>
				<div className="flex flex-row items-center gap-2.5">
					{activeSubmission.response.usage && (
						<ShowCost
							usage={activeSubmission.response.usage}
							modelId={activeSubmission.input.modelId}
							providerId={activeSubmission.input.providerId}
							modelList={modelList}
						/>
					)}
					<PreviewButton
						dialogueId={activeDialogue.id}
						submissionId={activeSubmission.id}
					/>
					<CopyButton text={codeContent} />
				</div>
			</CardHeader>
			<CardContent className="space-y-4 pt-4">
				<pre
					className={cn(
						"max-h-[200px] overflow-auto rounded-md bg-zinc-50 p-4 font-mono text-sm leading-relaxed",
						"border border-zinc-200",
						"dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200",
					)}
				>
					{codeContent}
				</pre>
				{responseData.advices && responseData.advices.length > 0 && (
					<div className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
						<h3 className="mb-3 font-medium text-sm text-zinc-800 dark:text-zinc-200">
							建议
						</h3>
						<AdviceList
							advices={responseData.advices || []}
							onAdviceClick={handleAdviceClick || (() => {})}
						/>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function EmptyState() {
	return (
		<Card className="flex h-full items-center justify-center border border-zinc-200 border-dashed shadow-none dark:border-zinc-800">
			<CardContent className="flex flex-col items-center p-10 text-center">
				<div className="mb-4 rounded-md bg-zinc-100 p-3 dark:bg-zinc-800">
					<CodeIcon className="h-10 w-10 text-zinc-400" aria-hidden="true" />
				</div>
				<p className="font-medium text-lg text-zinc-800 dark:text-zinc-200">
					无响应
				</p>
				<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
					提交提示词以查看 AI 响应
				</p>
			</CardContent>
		</Card>
	);
}

function LoadingState() {
	return (
		<Card className="h-full border border-zinc-200 shadow-none dark:border-zinc-800">
			<CardHeader className="flex flex-row items-center justify-between border-zinc-200 border-b pb-3 dark:border-zinc-800">
				<div className="flex items-center">
					<Skeleton className="h-6 w-36" />
				</div>
				<Skeleton className="h-8 w-24" />
			</CardHeader>
			<CardContent className="space-y-4 pt-5">
				<div className="space-y-2">
					<Skeleton className="h-4 w-3/4" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-2/3" />
					<Skeleton className="h-4 w-5/6" />
					<Skeleton className="h-4 w-3/4" />
				</div>
				<div className="space-y-2 pt-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-1/2" />
				</div>
			</CardContent>
		</Card>
	);
}
