"use client";

import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Loader2, Plus, RotateCcw } from "lucide-react";
import { useLlmSessionStore } from "../hooks/llm-session-store";

export default function SessionTabs() {
	const {
		sessions,
		activeSessionId,
		setActiveSession,
		addSession,
		clearAllSessions,
	} = useLlmSessionStore();

	const handleClearSessions = () => {
		if (confirm("确定要清除所有会话吗？")) {
			clearAllSessions();
		}
	};

	return (
		<div className="mb-2 flex items-center justify-between py-2">
			<div className="flex items-center">
				<span className="mr-2 text-xs text-zinc-500 dark:text-zinc-400">
					对话：
				</span>
				<div className="flex flex-wrap gap-1.5">
					{sessions.map((session, index) => {
						// Check if this specific session has any loading versions
						const hasLoadingVersion = session.versions.some(
							(version) => version.isLoading,
						);
						const isActive = session.id === activeSessionId;

						// Determine status styling
						let statusStyle = isActive
							? "bg-primary/10 text-primary border border-primary/30"
							: "bg-muted/20 text-muted-foreground hover:bg-muted/30";

						if (hasLoadingVersion) {
							statusStyle =
								"animate-pulse border-sky-400 bg-sky-500/15 text-sky-500 ring-1 ring-sky-400/30";
						}

						return (
							<TooltipProvider key={session.id}>
								<Tooltip>
									<TooltipTrigger asChild>
										<button
											type="button"
											className={cn(
												"flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm font-medium text-xs transition-all",
												statusStyle,
											)}
											onClick={() => setActiveSession(session.id)}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													setActiveSession(session.id);
												}
											}}
										>
											{index + 1}
											{hasLoadingVersion && (
												<span className="-top-1 -right-1 absolute flex h-2 w-2">
													<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
													<span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
												</span>
											)}
										</button>
									</TooltipTrigger>
									<TooltipContent side="bottom" align="start">
										<div className="text-xs">
											<p className="font-medium">对话 {index + 1}</p>
											{hasLoadingVersion && (
												<p className="mt-1 text-sky-500 text-xs">
													生成中...您可以创建新对话或切换到其他对话
												</p>
											)}
										</div>
									</TooltipContent>
								</Tooltip>
							</TooltipProvider>
						);
					})}

					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type="button"
									className="relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm bg-muted/20 text-muted-foreground hover:bg-sky-500/15 hover:text-sky-500 dark:hover:bg-sky-900/30 dark:hover:text-sky-400"
									onClick={addSession}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											addSession();
										}
									}}
								>
									<Plus className="h-3 w-3" />
								</button>
							</TooltipTrigger>
							<TooltipContent>
								<p className="text-xs">创建新对话 #{sessions.length + 1}</p>
								<p className="text-muted-foreground text-xs">
									可随时创建新对话，无需等待生成完成
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</div>
			</div>

			{/* Reset button */}
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							className="flex h-6 items-center gap-1 rounded-sm px-1.5 text-muted-foreground text-xs hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
							onClick={handleClearSessions}
							disabled={sessions.length <= 1}
							aria-label="重置所有会话"
						>
							<RotateCcw className="h-3 w-3" />
							<span>重置</span>
						</button>
					</TooltipTrigger>
					<TooltipContent>
						<div className="text-xs">
							<p className="font-medium">重置所有会话</p>
							<p className="text-muted-foreground">
								这将删除所有会话历史，无法恢复
							</p>
						</div>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}
