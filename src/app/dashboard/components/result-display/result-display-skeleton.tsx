"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ResultDisplaySkeleton() {
	return (
		<div className="relative animate-pulse rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
			{/* Header with submission selector */}
			<div className="mb-4 flex items-center justify-between">
				<Skeleton className="h-5 w-36 rounded-md bg-zinc-200 dark:bg-zinc-700" />
				<Skeleton className="h-8 w-24 rounded-md bg-zinc-200 dark:bg-zinc-700" />
			</div>

			{/* Code area */}
			<div className="mt-4 space-y-4">
				<Skeleton className="h-24 w-full rounded-md bg-zinc-200 dark:bg-zinc-700" />
				<Skeleton className="h-16 w-5/6 rounded-md bg-zinc-200 dark:bg-zinc-700" />
				<Skeleton className="h-20 w-full rounded-md bg-zinc-200 dark:bg-zinc-700" />
			</div>

			{/* Suggestions */}
			<div className="mt-6">
				<Skeleton className="mb-2 h-5 w-24 rounded-md bg-zinc-200 dark:bg-zinc-700" />
				<div className="flex flex-wrap gap-2">
					<Skeleton className="h-8 w-32 rounded-full bg-zinc-200 dark:bg-zinc-700" />
					<Skeleton className="h-8 w-28 rounded-full bg-zinc-200 dark:bg-zinc-700" />
					<Skeleton className="h-8 w-36 rounded-full bg-zinc-200 dark:bg-zinc-700" />
				</div>
			</div>
		</div>
	);
}
