"use server";

import { tryCatch } from "@/lib/try-catch";
import { deleteFromVercelBlob } from "@/lib/vercel-blob";
import { db } from "@/server/db";
import { favorite, project, tag, user } from "@/server/db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { unstable_cacheTag as cacheTag, revalidateTag } from "next/cache";
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

  cacheTag(`user:projects:${userId}`);

  if (!userId) {
    return { success: false, error: "请先登录" };
  }

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

  // Get tags for all projects in a single query
  const { data: allTags, error: tagsError } = await tryCatch(
    db
      .select({
        projectId: tag.projectId,
        name: tag.name,
      })
      .from(tag)
      .where(
        inArray(
          tag.projectId,
          userProjects.map((p) => p.id)
        )
      )
  );

  if (tagsError) {
    console.error("Failed to get project tags:", tagsError);
    return { success: false, error: "Failed to get project tags" };
  }

  // Group tags by project ID
  const tagsByProject = (allTags || []).reduce((acc, tag) => {
    const projectId = tag?.projectId;
    const name = tag?.name;
    if (projectId && name) {
      acc[projectId] = acc[projectId] || [];
      acc[projectId].push(name);
    }
    return acc;
  }, {} as Record<string, string[]>);

  // Map projects with their tags
  const projectsWithTags = userProjects.map((p) => ({
    ...p,
    tags: tagsByProject[p.id]?.join(", ") || null,
    user: {
      id: userId,
      name: "",
      image: null,
    },
  }));

  return { success: true, data: projectsWithTags };
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

  // Revalidate cache
  revalidateTag(`user:projects:${userId}`);

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

  // Revalidate cache
  revalidateTag(`user:projects:${userId}`);

  return { success: true };
}

// Cache user favorites for better performance
export const getUserFavorites = async (userId: string) => {
  "use cache";

  cacheTag(`user:favorites:${userId}`);

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

  // Get all tags in a single query
  const { data: tagsData, error: tagsError } = await tryCatch(
    db
      .select({
        projectId: tag.projectId,
        name: tag.name,
      })
      .from(tag)
      .where(inArray(tag.projectId, projectIds))
  );

  if (tagsError) {
    console.error("Failed to get project tags:", tagsError);
    return { success: false, error: "Failed to get project tags" };
  }

  // Create lookup maps for efficient access
  const userMap = new Map(usersData?.map((u) => [u.id, u]) || []);
  const tagMap = (tagsData || []).reduce((acc, tag) => {
    const projectId = tag?.projectId;
    const name = tag?.name;
    if (projectId && name) {
      acc[projectId] = acc[projectId] || [];
      acc[projectId].push(name);
    }
    return acc;
  }, {} as Record<string, string[]>);

  // Combine all data
  const favoriteProjects = projectsData.map((p) => ({
    ...p,
    tags: tagMap[p.id]?.join(", ") || null,
    user: userMap.get(p.userId) || undefined,
  }));

  return { success: true, data: favoriteProjects };
};
