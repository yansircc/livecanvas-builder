"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function LlmFormSkeleton() {
	return (
		<div className="relative mx-auto w-full animate-pulse">
			<div className="relative flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800">
				{/* Model Selector Skeleton */}
				<div className="flex items-center justify-between rounded-t-xl border-zinc-200 border-b bg-zinc-50 px-5 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
					<div className="flex items-center gap-2">
						<Skeleton className="h-5 w-5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
						<Skeleton className="h-5 w-28 rounded-md bg-zinc-200 dark:bg-zinc-700" />
					</div>
				</div>

				{/* Textarea Skeleton */}
				<div className="max-h-[200px] overflow-y-auto">
					<div className="p-4">
						<Skeleton className="h-[80px] w-full rounded-md bg-zinc-200 dark:bg-zinc-700" />
					</div>
				</div>

				{/* Bottom Toolbar Skeleton */}
				<div className="h-14 rounded-b-xl bg-zinc-50 transition-colors duration-150 dark:bg-zinc-900">
					{/* Left controls */}
					<div className="absolute bottom-4 left-4 z-10 flex items-center gap-3">
						<Skeleton className="h-6 w-6 rounded-md bg-zinc-200 dark:bg-zinc-700" />
						<Skeleton className="h-6 w-6 rounded-md bg-zinc-200 dark:bg-zinc-700" />
					</div>

					{/* Right button */}
					<div className="absolute right-4 bottom-4">
						<Skeleton className="h-9 w-9 rounded-md bg-zinc-200 dark:bg-zinc-700" />
					</div>
				</div>
			</div>
		</div>
	);
}
