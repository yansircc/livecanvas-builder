"use server";

import { tryCatch } from "@/lib/try-catch";
import { deleteFromVercelBlob } from "@/lib/vercel-blob";
import { db } from "@/server/db";
import { favorite, project, purchase, tag, user } from "@/server/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { unstable_cacheTag as cacheTag, revalidateTag } from "next/cache";

// Get all published projects with caching
export const getPublishedProjects = async () => {
	"use cache";

	cacheTag("projects");

	const result = await tryCatch(
		(async () => {
			// Use a simpler query without relations
			const projects = await db
				.select()
				.from(project)
				.where(eq(project.isPublished, true))
				.orderBy(desc(project.createdAt));

			// Fetch user information and tags for each project
			const projectsWithData = await Promise.all(
				projects.map(async (p) => {
					// Fetch user information
					const userData = await db
						.select({
							id: user.id,
							name: user.name,
							image: user.image,
						})
						.from(user)
						.where(eq(user.id, p.userId))
						.limit(1);

					// Fetch tags for this project
					const tagData = await db
						.select({
							name: tag.name,
						})
						.from(tag)
						.where(eq(tag.projectId, p.id));

					// Convert tags to comma-separated string
					const tagsString =
						tagData.length > 0 ? tagData.map((t) => t.name).join(", ") : null;

					return {
						...p,
						tags: tagsString, // Add tags as a string
						user: userData.length > 0 ? userData[0] : undefined,
					};
				}),
			);

			return projectsWithData;
		})(),
	);

	if (result.error) {
		console.error("Failed to get published projects:", result.error);
		return { success: false, error: "Failed to get published projects" };
	}

	return { success: true, data: result.data };
};

// Get a single project by ID with caching
export const getProjectById = async (projectId: string) => {
	"use cache";

	cacheTag(`project:${projectId}`);

	const result = await tryCatch(
		(async () => {
			const projectData = await db
				.select()
				.from(project)
				.where(eq(project.id, projectId))
				.limit(1);

			if (projectData.length === 0 || !projectData[0]) {
				throw new Error("Project not found");
			}

			// Fetch user information
			const userData = await db
				.select({
					id: user.id,
					name: user.name,
					image: user.image,
				})
				.from(user)
				.where(eq(user.id, projectData[0].userId))
				.limit(1);

			// Fetch tags for this project
			const tagData = await db
				.select({
					name: tag.name,
				})
				.from(tag)
				.where(eq(tag.projectId, projectId));

			// Convert tags to comma-separated string
			const tagsString =
				tagData.length > 0 ? tagData.map((t) => t.name).join(", ") : null;

			return {
				...projectData[0],
				tags: tagsString, // Add tags as a string
				user: userData.length > 0 ? userData[0] : undefined,
			};
		})(),
	);

	if (result.error) {
		console.error("Failed to get project:", result.error);
		return {
			success: false,
			error:
				result.error instanceof Error
					? result.error.message
					: "Failed to get project",
		};
	}

	return { success: true, data: result.data };
};

// Create a new project
export async function createProject(
	userId: string | undefined,
	data: {
		title: string;
		description?: string;
		htmlContent: string;
		thumbnail?: string;
		tags?: string;
		isPublished: boolean;
		projectId?: string;
	},
) {
	if (!userId) {
		return { success: false, error: "请先登录" };
	}

	const result = await tryCatch(
		(async () => {
			// Use provided projectId or generate a new one
			const projectId = data.projectId || nanoid();

			const newProject = await db
				.insert(project)
				.values({
					id: projectId,
					title: data.title,
					description: data.description || "",
					htmlContent: data.htmlContent,
					thumbnail: data.thumbnail || "",
					isPublished: data.isPublished,
					userId,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			// If tags are provided, create tag entries in a separate table
			if (data.tags) {
				const tagNames = data.tags
					.split(",")
					.map((tag) => tag.trim())
					.filter(Boolean);

				// Insert tags if any exist
				if (tagNames.length > 0) {
					await Promise.all(
						tagNames.map((name) =>
							db.insert(tag).values({
								name,
								projectId,
								createdAt: new Date(),
							}),
						),
					);
				}
			}

			revalidatePath("/gallery");

			return {
				project: newProject[0],
				shouldRedirect: data.isPublished,
			};
		})(),
	);

	if (result.error) {
		console.error("Failed to create project:", result.error);
		return { success: false, error: "Failed to create project" };
	}

	if (result.data.shouldRedirect) {
		return { success: true, data: result.data.project, redirect: "/gallery" };
	}
	return { success: true, data: result.data.project };
}

/**
 * Update a project
 * @param projectId - The ID of the project to update
 * @param data - The updated project data
 */
export async function updateProject(
	projectId: string,
	userId: string,
	data: {
		title?: string;
		description?: string | null;
		tags?: string | null;
		isPublished?: boolean;
	},
) {
	try {
		// Get the project to verify ownership
		const existingProject = await db.query.project.findFirst({
			where: and(eq(project.id, projectId), eq(project.userId, userId)),
		});

		if (!existingProject) {
			return {
				success: false,
				error: "Project not found or you do not have permission to update it",
			};
		}

		// Update the project
		await db
			.update(project)
			.set({
				...data,
				updatedAt: new Date(),
			})
			.where(eq(project.id, projectId));

		return { success: true };
	} catch (error) {
		console.error("Failed to update project:", error);
		return { success: false, error: "Failed to update project" };
	}
}

/**
 * Delete a project
 * @param projectId - The ID of the project to delete
 */
export async function deleteProject(projectId: string, userId: string) {
	try {
		// Get the project to verify ownership
		const existingProject = await db.query.project.findFirst({
			where: and(eq(project.id, projectId), eq(project.userId, userId)),
		});

		if (!existingProject) {
			return {
				success: false,
				error: "项目未找到或你没有权限删除它",
			};
		}

		// Delete the thumbnail if it exists
		if (existingProject.thumbnail?.includes("vercel-storage.com")) {
			try {
				// Parse the URL to get the path
				const urlObj = new URL(existingProject.thumbnail);
				const path = urlObj.pathname;

				if (path) {
					await deleteFromVercelBlob(path);
					console.log(`Deleted thumbnail for project ${projectId}`);
				}
			} catch (error) {
				// Log error but continue with project deletion
				console.error(
					`Failed to delete thumbnail for project ${projectId}:`,
					error,
				);
			}
		}

		// Delete the project
		await db.delete(project).where(eq(project.id, projectId));

		return { success: true };
	} catch (error) {
		console.error("删除项目失败:", error);
		return { success: false, error: "删除项目失败" };
	}
}

// purchase a project
export async function purchaseProject(projectId: string, userId: string) {
	try {
		// Check if the user has already purchased the project
		const existingpurchase = await db.query.purchase.findFirst({
			where: and(
				eq(purchase.projectId, projectId),
				eq(purchase.userId, userId),
			),
		});

		if (existingpurchase) {
			// Unpurchase the project
			await db.delete(purchase).where(eq(purchase.id, existingpurchase.id));

			// Decrement the purchases count
			await db
				.update(project)
				.set({
					purchaseCount: sql`${project.purchaseCount} - 1`,
				})
				.where(eq(project.id, projectId));

			return { success: true, purchased: false };
		}
		// purchase the project
		await db.insert(purchase).values({
			id: nanoid(),
			projectId,
			userId,
			createdAt: new Date(),
		});

		// Increment the purchases count
		await db
			.update(project)
			.set({
				purchaseCount: sql`${project.purchaseCount} + 1`,
			})
			.where(eq(project.id, projectId));

		return { success: true, purchased: true };
	} catch (error) {
		console.error("点赞项目失败:", error);
		return { success: false, error: "点赞项目失败" };
	}
}

// Favorite a project
export async function favoriteProject(projectId: string, userId: string) {
	try {
		// Check if the user has already favorited the project
		const existingFavorite = await db.query.favorite.findFirst({
			where: and(
				eq(favorite.projectId, projectId),
				eq(favorite.userId, userId),
			),
		});

		if (existingFavorite) {
			// Unfavorite the project
			await db.delete(favorite).where(eq(favorite.id, existingFavorite.id));

			return { success: true, favorited: false };
		}
		// Favorite the project
		await db.insert(favorite).values({
			id: nanoid(),
			projectId,
			userId,
			createdAt: new Date(),
		});

		return { success: true, favorited: true };
	} catch (error) {
		console.error("收藏项目失败:", error);
		return { success: false, error: "收藏项目失败" };
	}
}

// Cache user interactions for better performance
export const getUserInteractions = async (
	projectId: string,
	userId: string,
) => {
	const result = await tryCatch(
		(async () => {
			// Check if the user has purchased the project
			const userpurchase = await db.query.purchase.findFirst({
				where: and(
					eq(purchase.projectId, projectId),
					eq(purchase.userId, userId),
				),
			});

			// Check if the user has favorited the project
			const userFavorite = await db.query.favorite.findFirst({
				where: and(
					eq(favorite.projectId, projectId),
					eq(favorite.userId, userId),
				),
			});

			return {
				hasPurchased: !!userpurchase,
				hasFavorited: !!userFavorite,
			};
		})(),
	);

	if (result.error) {
		console.error("Failed to get user interactions:", result.error);
		return { success: false, error: "Failed to get user interactions" };
	}

	return { success: true, data: result.data };
};

// Cache user favorites for better performance
export const getUserFavorites = async (userId: string) => {
	"use cache";

	cacheTag(`user:favorites:${userId}`);

	const result = await tryCatch(
		(async () => {
			// Get the user's favorites
			const userFavorites = await db
				.select({
					projectId: favorite.projectId,
				})
				.from(favorite)
				.where(eq(favorite.userId, userId));

			// Get the details of each favorited project
			const favoriteProjects = await Promise.all(
				userFavorites.map(async (f) => {
					const projectData = await db
						.select()
						.from(project)
						.where(eq(project.id, f.projectId))
						.limit(1);

					if (projectData.length === 0 || !projectData[0]) return null;

					// Fetch user information
					const userData = await db
						.select({
							id: user.id,
							name: user.name,
							image: user.image,
						})
						.from(user)
						.where(eq(user.id, projectData[0].userId))
						.limit(1);

					return {
						...projectData[0],
						user: userData.length > 0 ? userData[0] : undefined,
					};
				}),
			);

			// Filter out any null values (projects that were deleted)
			return favoriteProjects.filter(
				(project): project is NonNullable<typeof project> => project !== null,
			);
		})(),
	);

	if (result.error) {
		console.error("Failed to get user favorites:", result.error);
		return { success: false, error: "Failed to get user favorites" };
	}

	return { success: true, data: result.data };
};

// Cache user projects for better performance
export const getUserProjects = async (userId: string | undefined) => {
	"use cache";

	cacheTag(`user:projects:${userId}`);

	if (!userId) {
		return { success: false, error: "请先登录" };
	}

	const result = await tryCatch(
		(async () => {
			// Get the user's projects
			const userProjects = await db
				.select()
				.from(project)
				.where(eq(project.userId, userId))
				.orderBy(desc(project.createdAt));

			// Add user information and tags to each project
			const projectsWithTags = await Promise.all(
				userProjects.map(async (p) => {
					// Fetch tags for this project
					const tagData = await db
						.select({
							name: tag.name,
						})
						.from(tag)
						.where(eq(tag.projectId, p.id));

					// Convert tags to comma-separated string
					const tagsString =
						tagData.length > 0 ? tagData.map((t) => t.name).join(", ") : null;

					return {
						...p,
						tags: tagsString,
						user: {
							id: userId,
							name: "",
							image: null,
						},
					};
				}),
			);

			return projectsWithTags;
		})(),
	);

	if (result.error) {
		console.error("Failed to get user projects:", result.error);
		return { success: false, error: "Failed to get user projects" };
	}

	return { success: true, data: result.data };
};

// Get all user interactions for multiple projects
export const getAllUserInteractions = async (userId: string) => {
	"use cache";

	cacheTag(`user:interactions:${userId}`);

	const result = await tryCatch(
		(async () => {
			// Get all user purchases
			const userpurchases = await db
				.select({
					projectId: purchase.projectId,
				})
				.from(purchase)
				.where(eq(purchase.userId, userId));

			// Get all user favorites
			const userFavorites = await db
				.select({
					projectId: favorite.projectId,
				})
				.from(favorite)
				.where(eq(favorite.userId, userId));

			// Create a map of project interactions
			const interactionsMap: Record<
				string,
				{ hasPurchased: boolean; hasFavorited: boolean }
			> = {};

			// Add purchases to map - use loop with explicit type checking
			for (const item of userpurchases) {
				const projectId = item.projectId;
				if (typeof projectId === "string") {
					if (!interactionsMap[projectId]) {
						interactionsMap[projectId] = {
							hasPurchased: false,
							hasFavorited: false,
						};
					}
					interactionsMap[projectId].hasPurchased = true;
				}
			}

			// Add favorites to map - use loop with explicit type checking
			for (const item of userFavorites) {
				const projectId = item.projectId;
				if (typeof projectId === "string") {
					if (!interactionsMap[projectId]) {
						interactionsMap[projectId] = {
							hasPurchased: false,
							hasFavorited: false,
						};
					}
					interactionsMap[projectId].hasFavorited = true;
				}
			}

			return interactionsMap;
		})(),
	);

	if (result.error) {
		console.error("Failed to get all user interactions:", result.error);
		return { success: false, error: "Failed to get all user interactions" };
	}

	return {
		success: true,
		data: result.data,
	};
};
