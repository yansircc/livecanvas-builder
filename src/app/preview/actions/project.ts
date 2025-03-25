"use server";

import { tryCatch } from "@/lib/try-catch";
import { revalidateProjectCache, revalidateUserCache } from "@/server/cache";
import { db } from "@/server/db";
import { project } from "@/server/db/schema";
import { nanoid } from "nanoid";

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
  }
) {
  if (!userId) {
    return { success: false, error: "请先登录" };
  }

  // Use provided projectId or generate a new one
  const projectId = data.projectId || nanoid();

  const { data: newProject, error } = await tryCatch(
    db
      .insert(project)
      .values({
        id: projectId,
        title: data.title,
        description: data.description || "",
        htmlContent: data.htmlContent,
        thumbnail: data.thumbnail || "",
        tags: data.tags || "",
        isPublished: data.isPublished,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
  );

  if (error) {
    console.error("Failed to create project:", error);
    return { success: false, error: "Failed to create project" };
  }

  // Revalidate project and user caches
  revalidateProjectCache(projectId);
  revalidateUserCache(userId);

  if (data.isPublished) {
    return { success: true, data: newProject[0], redirect: "/gallery" };
  }

  return { success: true, data: newProject[0] };
}
