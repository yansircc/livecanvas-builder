"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useLlmSessionStore } from "../hooks/llm-session-store";
export default function VersionSelector() {
	const { sessions, activeSessionId, setActiveVersion } = useLlmSessionStore();

	// Find active session
	const activeSession = sessions.find(
		(session) => session.id === activeSessionId,
	);

	// If no session or no versions, don't render anything
	if (!activeSession || activeSession.versions.length === 0) {
		return null;
	}

	const handleVersionChange = (versionId: string) => {
		setActiveVersion(activeSessionId, Number.parseInt(versionId));
	};

	return (
		<Select
			value={activeSession.activeVersionId?.toString() || ""}
			onValueChange={handleVersionChange}
		>
			<SelectTrigger className="h-8 w-[120px]">
				<SelectValue placeholder="选择版本" />
			</SelectTrigger>
			<SelectContent>
				{activeSession.versions.map((version) => (
					<SelectItem
						key={version.id}
						value={version.id.toString()}
						disabled={version.isLoading}
					>
						{version.isLoading ? "加载中..." : `版本 ${version.id}`}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
