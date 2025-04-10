import { auth } from "@/server/auth";
import { addAuthCacheTags } from "@/server/cache";
import type { Project } from "@/types/project";
import type { Session } from "next-auth";
import { Suspense } from "react";
import {
	getAllTags,
	getAllUserInteractions,
	getPublishedProjects,
} from "./actions";
import { ClientGallery } from "./components/client-gallery";
import { GalleryLoading } from "./components/gallery-loading";
import { GalleryLoadingProvider } from "./components/gallery-loading-provider";

interface UserInteraction {
	hasPurchased: boolean;
	hasFavorited: boolean;
}

/**
 * 获取缓存会话数据
 * @param sessionData 会话数据
 * @returns 返回会话数据
 */
async function getCachedSessionData(sessionData: Session) {
	"use cache";
	addAuthCacheTags(sessionData.user.id);
	return sessionData;
}

interface GalleryContentProps {
	searchParams: Promise<{
		page?: string;
		pageSize?: string;
		tag?: string | string[];
	}>;
}

// This is the client boundary component that will be wrapped in Suspense
async function GalleryContent({ searchParams }: GalleryContentProps) {
	const sessionData = await auth();
	if (!sessionData) {
		return null;
	}

	// Get the resolved searchParams
	const params = await searchParams;

	// Extract pagination params from URL
	const page = Number.parseInt(params.page || "1", 10);
	const pageSize = Number.parseInt(params.pageSize || "12", 10);

	// Extract tag filters from URL
	const tagFilters = params.tag
		? Array.isArray(params.tag)
			? params.tag
			: [params.tag]
		: [];

	// Get user session in parallel with data fetching
	const sessionPromise = getCachedSessionData(sessionData);
	const projectsPromise = getPublishedProjects(page, pageSize, tagFilters);
	const tagsPromise = getAllTags();

	// Wait for all data to be fetched
	const [session, publishedResult, tagsResult] = await Promise.all([
		sessionPromise,
		projectsPromise,
		tagsPromise,
	]);

	// Extract user info
	const userId = session?.user?.id;
	const isAuthenticated = !!userId;

	// Extract projects and pagination data with fallback
	const projectsData = publishedResult.success
		? publishedResult.data || {
				projects: [],
				pagination: {
					page: 1,
					pageSize: 12,
					totalCount: 0,
					totalPages: 0,
					hasNextPage: false,
					hasPrevPage: false,
				},
			}
		: {
				projects: [],
				pagination: {
					page: 1,
					pageSize: 12,
					totalCount: 0,
					totalPages: 0,
					hasNextPage: false,
					hasPrevPage: false,
				},
			};
	const allProjects = projectsData.projects || [];
	const pagination = projectsData.pagination;

	// Extract all available tags
	const allTags = tagsResult.success ? tagsResult.data || [] : [];

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
		<GalleryLoadingProvider>
			<ClientGallery
				initialProjects={allProjects as Project[]}
				initialInteractions={interactions}
				userId={userId}
				isAuthenticated={isAuthenticated}
				pagination={pagination}
				selectedTags={tagFilters}
				allAvailableTags={allTags}
			/>
		</GalleryLoadingProvider>
	);
}

/**
 * Server component that handles Suspense boundary
 */
export default async function GalleryPage({
	searchParams,
}: {
	searchParams: Promise<{
		page?: string;
		pageSize?: string;
		tag?: string | string[];
	}>;
}) {
	return (
		<Suspense fallback={<GalleryLoading />}>
			<GalleryContent searchParams={searchParams} />
		</Suspense>
	);
}
