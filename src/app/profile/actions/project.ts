"use server";

import { tryCatch } from "@/lib/try-catch";
import { deleteFromVercelBlob } from "@/lib/vercel-blob";
import {
  addProjectCacheTags,
  addProjectInteractionCacheTags,
  addUserCacheTags,
  revalidateProjectCache,
  revalidateProjectInteraction,
  revalidateUserCache,
} from "@/server/cache";
import { db } from "@/server/db";
import { favorite, project, user } from "@/server/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1, { message: "姓名不能为空" }),
  image: z.string().optional(),
  backgroundInfo: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Cache user projects for better performance
export const getUserProjects = async (userId: string | undefined) => {
  "use cache";

  if (!userId) {
    return { success: false, error: "请先登录" };
  }

  // Add cache tags for user's project list
  addUserCacheTags(userId);
  addProjectCacheTags("list", userId);

  // Get the user's projects
  const { data: userProjects, error: projectsError } = await tryCatch(
    db
      .select()
      .from(project)
      .where(eq(project.userId, userId))
      .orderBy(desc(project.createdAt))
  );

  if (projectsError) {
    console.error("Failed to get user projects:", projectsError);
    return { success: false, error: "Failed to get user projects" };
  }

  if (!userProjects.length) {
    return { success: true, data: [] };
  }

  // Add cache tags for each project
  for (const p of userProjects) {
    addProjectCacheTags(p.id);
  }

  // Map projects with user info
  const projectsWithData = userProjects.map((p) => ({
    ...p,
    user: {
      id: userId,
      name: "",
      image: null,
    },
  }));

  return { success: true, data: projectsWithData };
};

/**
 * Delete a project
 * @param projectId - The ID of the project to delete
 */
export async function deleteProject(projectId: string, userId: string) {
  // Verify project exists and user has permission
  const existingProject = await db.query.project.findFirst({
    where: and(eq(project.id, projectId), eq(project.userId, userId)),
  });

  if (!existingProject) {
    return { success: false, error: "项目未找到或你没有权限删除它" };
  }

  // Handle thumbnail deletion if exists
  const shouldDeleteThumbnail =
    existingProject.thumbnail?.includes("vercel-storage.com");
  if (shouldDeleteThumbnail) {
    const urlObj = new URL(existingProject.thumbnail as string);
    const path = urlObj.pathname;

    const { error: thumbnailError } = await tryCatch(
      deleteFromVercelBlob(path)
    );

    if (thumbnailError) {
      console.error(
        `Failed to delete thumbnail for project ${projectId}:`,
        thumbnailError
      );
    } else {
      console.log(`Deleted thumbnail for project ${projectId}`);
    }
  }

  // Delete the project
  const { error: deleteError } = await tryCatch(
    db.delete(project).where(eq(project.id, projectId))
  );

  if (deleteError) {
    console.error("Failed to delete project:", deleteError);
    return { success: false, error: "Failed to delete project" };
  }

  // Revalidate caches
  revalidateProjectCache(projectId);
  revalidateUserCache(userId);

  return { success: true };
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
  }
) {
  if (!data) {
    return { success: false, error: "Invalid update data" };
  }

  // Verify project exists and user has permission
  const existingProject = await db.query.project.findFirst({
    where: and(eq(project.id, projectId), eq(project.userId, userId)),
  });

  if (!existingProject) {
    return { success: false, error: "项目未找到或你没有权限更新它" };
  }

  // Perform the update
  const { error } = await tryCatch(
    db
      .update(project)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(project.id, projectId))
  );

  if (error) {
    console.error("Failed to update project:", error);
    return { success: false, error: "Failed to update project" };
  }

  // Revalidate caches
  revalidateProjectCache(projectId);
  if (data.isPublished !== undefined) {
    revalidateUserCache(userId);
  }

  return { success: true };
}

// Cache user favorites for better performance
export const getUserFavorites = async (userId: string) => {
  "use cache";

  // Add cache tags for user's favorites and interactions
  addUserCacheTags(userId);
  addProjectInteractionCacheTags(userId, userId, "FAVORITED");

  // Get user favorites
  const { data: userFavorites, error: favoritesError } = await tryCatch(
    db
      .select({
        projectId: favorite.projectId,
      })
      .from(favorite)
      .where(eq(favorite.userId, userId))
  );

  if (favoritesError) {
    console.error("Failed to get user favorites:", favoritesError);
    return { success: false, error: "Failed to get user favorites" };
  }

  if (!userFavorites?.length) {
    return { success: true, data: [] };
  }

  const projectIds = userFavorites.map((f) => f.projectId).filter(Boolean);

  if (!projectIds.length) {
    return { success: true, data: [] };
  }

  // Get all projects data in a single query
  const { data: projectsData, error: projectsError } = await tryCatch(
    db.select().from(project).where(inArray(project.id, projectIds))
  );

  if (projectsError) {
    console.error("Failed to get favorite projects:", projectsError);
    return { success: false, error: "Failed to get favorite projects" };
  }

  if (!projectsData?.length) {
    return { success: true, data: [] };
  }

  // Add cache tags for each project
  for (const p of projectsData) {
    addProjectCacheTags(p.id);
  }

  // Get all users data in a single query
  const userIds = projectsData.map((p) => p.userId).filter(Boolean);
  const { data: usersData, error: usersError } = await tryCatch(
    db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
      })
      .from(user)
      .where(inArray(user.id, userIds))
  );

  if (usersError) {
    console.error("Failed to get users data:", usersError);
    return { success: false, error: "Failed to get users data" };
  }

  // Add cache tags for each user
  for (const u of usersData || []) {
    addUserCacheTags(u.id);
  }

  // Create lookup map for users
  const userMap = new Map(usersData?.map((u) => [u.id, u]) || []);

  // Combine all data
  const favoriteProjects = projectsData.map((p) => ({
    ...p,
    user: userMap.get(p.userId) || undefined,
  }));

  return { success: true, data: favoriteProjects };
};
