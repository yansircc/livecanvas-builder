"use client";

import type { Session } from "next-auth";
import { useMemo, useState } from "react";
import { useLlmSessionStore } from "../../store/llm-session-store";
import { AdviceList } from "./advice-list";
import { LlmFormComponent } from "./form";
import { TokenUsageDisplay } from "./token-usage-display";
import type { ResponseData } from "./types";

interface LlmFormProps {
	session: Session | null;
}

export default function LlmForm({ session }: LlmFormProps) {
	const { activeSessionId, sessions } = useLlmSessionStore();
	const [prompt, setPrompt] = useState("");

	const activeSession = sessions.find(
		(session) => session.id === activeSessionId,
	);

	// Get the active version if it exists
	const activeVersion = activeSession?.activeVersionId
		? activeSession.versions.find((v) => v.id === activeSession.activeVersionId)
		: null;

	// Parse response data to get advice and usage
	const { adviceItems, tokenUsage } = useMemo(() => {
		let adviceItems: string[] = [];
		let tokenUsage = undefined;

		if (activeVersion?.response) {
			try {
				const responseData = JSON.parse(
					activeVersion.response.content,
				) as ResponseData;
				adviceItems = responseData.advices || [];
				tokenUsage = responseData.usage;
			} catch (e) {
				console.error("Failed to parse response data", e);
			}
		}

		return { adviceItems, tokenUsage };
	}, [activeVersion]);

	// Handle clicking on an advice item to append to textarea
	const handleAdviceClick = (advice: string) => {
		const newValue = prompt ? `${prompt}\n\n${advice}` : advice;
		setPrompt(newValue);
	};

	const selectedModelId = activeVersion?.input.modelId || "";

	return (
		<div className="space-y-4">
			<LlmFormComponent session={session} />

			{tokenUsage && selectedModelId && (
				<TokenUsageDisplay tokenUsage={tokenUsage} modelId={selectedModelId} />
			)}

			<AdviceList
				adviceItems={adviceItems || []}
				versionId={activeVersion?.id}
				onAdviceClick={handleAdviceClick}
			/>
		</div>
	);
}
