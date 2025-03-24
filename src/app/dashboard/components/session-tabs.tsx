"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useLlmSessionStore } from "../store/llm-session-store";

export default function SessionTabs() {
	const {
		sessions,
		activeSessionId,
		setActiveSession,
		addSession,
		clearAllSessions,
	} = useLlmSessionStore();

	const handleClearSessions = () => {
		if (confirm("Are you sure you want to clear all sessions?")) {
			clearAllSessions();
		}
	};

	return (
		<div className="flex items-center justify-between border-b pb-2">
			<Tabs
				value={activeSessionId.toString()}
				onValueChange={(value) => setActiveSession(Number.parseInt(value))}
				className="flex-1 overflow-x-auto"
			>
				<TabsList className="w-full justify-start">
					{sessions.map((session) => {
						// Check if this specific session has any loading versions
						const hasLoadingVersion = session.versions.some(
							(version) => version.isLoading,
						);

						return (
							<TabsTrigger
								key={session.id}
								value={session.id.toString()}
								className="flex min-w-[60px] items-center"
							>
								{session.id}
								{hasLoadingVersion && (
									<Loader2 className="ml-2 h-3 w-3 animate-spin" />
								)}
							</TabsTrigger>
						);
					})}
					<Button
						variant="ghost"
						size="icon"
						onClick={addSession}
						className="h-8 w-8"
					>
						<Plus className="h-4 w-4" />
					</Button>
				</TabsList>
			</Tabs>

			<Button
				variant="ghost"
				size="sm"
				onClick={handleClearSessions}
				className="text-destructive"
				disabled={sessions.length <= 1}
			>
				<Trash2 className="mr-1 h-4 w-4" />
				Clear All
			</Button>
		</div>
	);
}
