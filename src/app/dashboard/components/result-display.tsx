"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ModelList } from "@/lib/models";
import { useLlmSessionStore } from "../hooks/llm-session-store";
import { AdviceList } from "./advice-list";
import { CopyButton } from "./copy-button";
import { PreviewButton } from "./preview-button";
import ShowCost from "./show-cost";
import VersionSelector from "./version-selector";

interface ResponseData {
	code?: string;
	advices?: string[];
	[key: string]: unknown;
}

interface ResultDisplayProps {
	modelList: ModelList;
}

export default function ResultDisplay({ modelList }: ResultDisplayProps) {
	const { sessions, activeSessionId } = useLlmSessionStore();

	const activeSession = sessions.find(
		(session) => session.id === activeSessionId,
	);
	if (!activeSession) {
		return <EmptyState />;
	}

	const activeVersion = activeSession.activeVersionId
		? activeSession.versions.find((v) => v.id === activeSession.activeVersionId)
		: null;

	if (!activeVersion) {
		return <EmptyState />;
	}

	if (activeVersion.isLoading) {
		return <LoadingState />;
	}

	if (!activeVersion.response) {
		return <EmptyState />;
	}

	let responseData: ResponseData;
	let codeContent: string;

	try {
		// Try to parse the response content as JSON
		responseData = JSON.parse(activeVersion.response.content);
		codeContent = responseData.code || "";
	} catch (error) {
		// If parsing fails, use the content directly as the code
		console.warn(
			"Response is not valid JSON, using content directly as HTML code",
		);
		codeContent = activeVersion.response.content;
		responseData = { code: codeContent };
	}

	// If no code, show an empty code state
	if (!codeContent) {
		return (
			<Card className="h-full">
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle>AI 响应</CardTitle>
					{activeSession.versions.length > 0 && <VersionSelector />}
				</CardHeader>
				<CardContent className="flex h-full items-center justify-center">
					<p className="text-muted-foreground">没有代码</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="h-full">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle>代码</CardTitle>
				<div className="flex flex-row items-center gap-2">
					{activeVersion.response.usage && (
						<ShowCost
							usage={activeVersion.response.usage}
							modelId={activeVersion.input.modelId || ""}
							providerId={activeVersion.input.providerId || ""}
							modelList={modelList}
						/>
					)}
					<PreviewButton
						sessionId={activeSession.id}
						versionId={activeVersion.id}
					/>
					<CopyButton text={codeContent} />
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<pre className="overflow-auto rounded-md bg-muted p-4 text-sm">
					{codeContent}
				</pre>
				<AdviceList
					advices={responseData.advices || []}
					onAdviceClick={() => {}}
				/>
			</CardContent>
		</Card>
	);
}

function EmptyState() {
	return (
		<Card className="flex h-full items-center justify-center">
			<CardContent className="p-6 text-center">
				<p className="text-muted-foreground">提交提示词以查看 AI 响应</p>
			</CardContent>
		</Card>
	);
}

function LoadingState() {
	return (
		<Card className="h-full">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle>
					<Skeleton className="h-8 w-32" />
				</CardTitle>
				<VersionSelector />
			</CardHeader>
			<CardContent className="space-y-4">
				<Skeleton className="h-32 w-full" />
			</CardContent>
		</Card>
	);
}
