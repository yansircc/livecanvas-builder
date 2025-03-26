"use server";

import { unstable_cacheTag as cacheTag, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "./cache-tags";

/**
 * Add cache tags for a project and its related data
 */
export async function addProjectCacheTags(projectId: string, userId?: string) {
	// Add project detail cache tag
	cacheTag(CACHE_TAGS.PROJECT.DETAIL(projectId));
	cacheTag(CACHE_TAGS.PROJECT.LIST.PUBLIC);

	// Add user-specific cache tags if userId is provided
	if (userId) {
		cacheTag(CACHE_TAGS.PROJECT.LIST.BY_USER(userId));
	}
}

/**
 * Add cache tags for a user and their related data
 */
export async function addUserCacheTags(userId: string) {
	cacheTag(CACHE_TAGS.USER.PROFILE(userId));
	cacheTag(CACHE_TAGS.PROJECT.LIST.BY_USER(userId));
	cacheTag(CACHE_TAGS.PROJECT.INTERACTION.LISTS.PURCHASED(userId));
	cacheTag(CACHE_TAGS.PROJECT.INTERACTION.LISTS.FAVORITED(userId));
}

/**
 * Add edge config cache tags
 */
export async function addEdgeConfigCacheTags() {
	cacheTag(CACHE_TAGS.EDGE_CONFIG.MODEL_LIST);
}

/**
 * Revalidate project-related cache tags
 */
export async function revalidateProjectCache(
	projectId: string,
	userId?: string,
) {
	// Always revalidate project detail and public list
	revalidateTag(CACHE_TAGS.PROJECT.DETAIL(projectId));
	revalidateTag(CACHE_TAGS.PROJECT.LIST.PUBLIC);

	// Revalidate user-specific cache if userId is provided
	if (userId) {
		revalidateTag(CACHE_TAGS.PROJECT.LIST.BY_USER(userId));
	}
}

/**
 * Revalidate user-related cache tags
 */
export async function revalidateUserCache(userId: string) {
	revalidateTag(CACHE_TAGS.USER.PROFILE(userId));
	revalidateTag(CACHE_TAGS.PROJECT.LIST.BY_USER(userId));
	revalidateTag(CACHE_TAGS.PROJECT.INTERACTION.LISTS.PURCHASED(userId));
	revalidateTag(CACHE_TAGS.PROJECT.INTERACTION.LISTS.FAVORITED(userId));
}

/**
 * Add cache tags for project interactions
 */
export async function addProjectInteractionCacheTags(
	projectId: string,
	userId: string,
	type: "PURCHASED" | "FAVORITED",
) {
	// Add specific interaction cache tag
	if (type === "PURCHASED") {
		cacheTag(CACHE_TAGS.PROJECT.INTERACTION.PURCHASED(projectId, userId));
		cacheTag(CACHE_TAGS.PROJECT.INTERACTION.LISTS.PURCHASED(userId));
	} else {
		cacheTag(CACHE_TAGS.PROJECT.INTERACTION.FAVORITED(projectId, userId));
		cacheTag(CACHE_TAGS.PROJECT.INTERACTION.LISTS.FAVORITED(userId));
	}

	// Always add project detail and list cache tags
	cacheTag(CACHE_TAGS.PROJECT.DETAIL(projectId));
	cacheTag(CACHE_TAGS.PROJECT.LIST.BY_USER(userId));
}

/**
 * Revalidate project interaction cache tags
 */
export async function revalidateProjectInteraction(
	projectId: string,
	userId: string,
	type: "PURCHASED" | "FAVORITED",
) {
	// Revalidate specific interaction
	if (type === "PURCHASED") {
		revalidateTag(CACHE_TAGS.PROJECT.INTERACTION.PURCHASED(projectId, userId));
		revalidateTag(CACHE_TAGS.PROJECT.INTERACTION.LISTS.PURCHASED(userId));
	} else {
		revalidateTag(CACHE_TAGS.PROJECT.INTERACTION.FAVORITED(projectId, userId));
		revalidateTag(CACHE_TAGS.PROJECT.INTERACTION.LISTS.FAVORITED(userId));
	}

	// Always revalidate project detail and list
	revalidateTag(CACHE_TAGS.PROJECT.DETAIL(projectId));
	revalidateTag(CACHE_TAGS.PROJECT.LIST.BY_USER(userId));
	revalidateTag(CACHE_TAGS.PROJECT.LIST.PUBLIC);
}

/**
 * Add auth-related cache tags
 */
export async function addAuthCacheTags(userId: string) {
	cacheTag(CACHE_TAGS.AUTH.SESSION);
	cacheTag(CACHE_TAGS.AUTH.USER(userId));
}

/**
 * Revalidate auth-related cache tags
 */
export async function revalidateAuthCache(userId: string) {
	revalidateTag(CACHE_TAGS.AUTH.SESSION);
	revalidateTag(CACHE_TAGS.AUTH.USER(userId));
}

/**
 * Revalidate edge config cache tags
 */
export async function revalidateModelListCache() {
	revalidateTag(CACHE_TAGS.EDGE_CONFIG.MODEL_LIST);
}
