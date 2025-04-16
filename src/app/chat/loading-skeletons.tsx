import React from "react";

export const ACFSkeletonLoader = () => {
	return (
		<div className="mt-3 animate-pulse rounded border border-gray-200 p-3 dark:border-zinc-700">
			<div className="flex items-center justify-between">
				<div className="h-5 w-36 rounded bg-gray-200 dark:bg-zinc-700" />
				<div className="h-10 w-32 rounded bg-gray-200 dark:bg-zinc-700" />
			</div>
		</div>
	);
};

export const LNLSkeletonLoader = () => {
	return (
		<div className="mt-3 animate-pulse rounded border border-gray-200 p-3 dark:border-zinc-700">
			<div className="flex items-center justify-between">
				<div className="h-5 w-32 rounded bg-gray-200 dark:bg-zinc-700" />
				<div className="h-10 w-32 rounded bg-gray-200 dark:bg-zinc-700" />
			</div>
		</div>
	);
};
