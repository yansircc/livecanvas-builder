import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@/server/auth";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { Suspense } from "react";
import { getUserFavorites } from "../actions";
import FavoriteProjectsClient from "./client";

/**
 * Get cached favorites data
 */
async function getCachedFavorites(userId: string) {
	"use cache";
	cacheTag(`favorites:${userId}`);

	try {
		const result = await getUserFavorites(userId);
		return result.success ? result.data || [] : [];
	} catch (error) {
		console.error("Failed to load favorites:", error);
		return [];
	}
}

async function FavoriteProjectsContent() {
	const session = await auth();

	if (!session?.user?.id) {
		return (
			<Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
				<CardHeader>
					<CardTitle>Favorite Projects</CardTitle>
					<CardDescription>
						Browse your favorite projects from the gallery
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center justify-center rounded-lg border border-zinc-300 border-dashed bg-zinc-50 py-12 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
						<p className="text-zinc-500 dark:text-zinc-400">
							Please log in to view your favorites
						</p>
						<Button
							className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
							asChild
						>
							<a href="/login">Log In</a>
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	const projects = await getCachedFavorites(session.user.id);

	return (
		<Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
			<CardHeader>
				<CardTitle>Favorite Projects</CardTitle>
				<CardDescription>
					Browse your favorite projects from the gallery
				</CardDescription>
			</CardHeader>
			<CardContent>
				<FavoriteProjectsClient initialProjects={projects} />
			</CardContent>
		</Card>
	);
}

export default async function FavoriteProjectsPage() {
	return (
		<Suspense
			fallback={
				<Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
					<CardHeader>
						<CardTitle>Favorite Projects</CardTitle>
						<CardDescription>
							Browse your favorite projects from the gallery
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"].map((skeletonId) => (
								<Card
									key={skeletonId}
									className="overflow-hidden border-zinc-200 dark:border-zinc-800"
								>
									<div className="aspect-video w-full">
										<Skeleton className="h-full w-full" />
									</div>
									<CardContent className="p-4">
										<Skeleton className="mb-2 h-6 w-3/4" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="mt-1 h-4 w-2/3" />
									</CardContent>
								</Card>
							))}
						</div>
					</CardContent>
				</Card>
			}
		>
			<FavoriteProjectsContent />
		</Suspense>
	);
}
