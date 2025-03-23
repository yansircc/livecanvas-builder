"use server";

import { auth } from "@/server/auth";
import type { Project } from "@/types";
import type { Session } from "next-auth";
import { unstable_cacheTag as cacheTag, revalidateTag } from "next/cache";
import { Suspense } from "react";
import { getAllUserInteractions, getPublishedProjects } from "./actions";
import { ClientGallery } from "./components/client-gallery";
import { GalleryLoading } from "./components/gallery-loading";

interface UserInteraction {
	hasPurchased: boolean;
	hasFavorited: boolean;
}

/**
 * 获取缓存会话数据
 * @param sessionData 会话数据
 * @returns 返回会话数据
 */
async function getCachedSessionData(sessionData: Session | null) {
	"use cache";
	cacheTag("auth");

	// 模拟一个加载延迟
	await new Promise((resolve) => setTimeout(resolve, 1500));
	return sessionData;
}

// This is the client boundary component that will be wrapped in Suspense
async function GalleryContent() {
	// Get user session in parallel with data fetching
	const sessionPromise = getCachedSessionData(await auth());
	const projectsPromise = getPublishedProjects();

	// Wait for all data to be fetched
	const [session, publishedResult] = await Promise.all([
		sessionPromise,
		projectsPromise,
	]);

	// Extract user info
	const userId = session?.user?.id;
	const isAuthenticated = !!userId;

	// Extract projects with fallback to empty array
	const allProjects = publishedResult.success ? publishedResult.data || [] : [];

	// Fetch user interactions if authenticated
	let userInteractions: Record<string, UserInteraction> = {};
	if (isAuthenticated && userId) {
		const interactionsResult = await getAllUserInteractions(userId);
		if (interactionsResult.success) {
			userInteractions = interactionsResult.data || {};
		}
	}

	// Pre-compute interactions map using project IDs, including user's actual interactions
	const interactions = Object.fromEntries(
		allProjects
			.filter((project) => project?.id)
			.map((project) => [
				project.id,
				userInteractions[project.id] || {
					hasPurchased: false,
					hasFavorited: false,
				},
			]),
	);

	return (
		<ClientGallery
			initialProjects={allProjects as Project[]}
			initialInteractions={interactions}
			userId={userId}
			isAuthenticated={isAuthenticated}
		/>
	);
}

/**
 * Server component that handles Suspense boundary
 */
export default async function GalleryPage() {
	return (
		<Suspense fallback={<GalleryLoading />}>
			<GalleryContent />
		</Suspense>
	);
}
