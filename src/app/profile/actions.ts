"use server";

import { tryCatch } from "@/lib/try-catch";
import { deleteFromVercelBlob } from "@/lib/vercel-blob";
import { db } from "@/server/db";
import { favorite, project, tag, user } from "@/server/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { unstable_cacheTag as cacheTag, revalidateTag } from "next/cache";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1, { message: "姓名不能为空" }),
  image: z.string().optional(),
  backgroundInfo: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

/**
 * 更新用户个人资料
 */
export async function updateUserProfile(formData: FormData) {
  // 模拟延迟
  await new Promise((resolve) => setTimeout(resolve, 1000));

  try {
    // 从表单数据获取值
    const name = formData.get("name") as string;
    const backgroundInfo = formData.get("backgroundInfo") as string;
    const image = (formData.get("image") as string) || "";

    // 验证数据
    const validatedData = profileSchema.parse({
      name,
      backgroundInfo,
      image,
    });

    // 这里应该添加实际的数据库更新逻辑
    console.log("更新用户资料:", validatedData);

    // 重新验证获取用户资料的缓存
    revalidateTag("user-profile");

    return { success: true, data: validatedData };
  } catch (error) {
    console.error("更新用户资料失败:", error);
    return { success: false, error: "更新用户资料失败" };
  }
}

/**
 * 上传用户头像
 */
export async function uploadUserAvatar(formData: FormData) {
  // 模拟延迟
  await new Promise((resolve) => setTimeout(resolve, 1500));

  try {
    // 获取上传的文件
    const file = formData.get("file") as File;

    if (!file) {
      throw new Error("未找到上传的文件");
    }

    // 这里应该添加实际的文件上传逻辑，例如上传到云存储
    // 为了演示，这里返回一个随机的头像 URL
    const avatarUrl = `https://avatars.githubusercontent.com/u/${Math.floor(
      Math.random() * 10000
    )}`;

    return { success: true, url: avatarUrl };
  } catch (error) {
    console.error("上传头像失败:", error);
    return { success: false, error: "上传头像失败" };
  }
}

/**
 * 获取用户个人资料
 */
export async function getUserProfile(userId: string) {
  "use cache";

  // 使用缓存标签，方便更新时重新验证
  revalidateTag("user-profile");

  // 模拟延迟
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 这里应该添加实际的数据库获取逻辑
  return {
    name: "测试用户",
    email: "test@example.com",
    image: `https://avatars.githubusercontent.com/u/${Math.floor(
      Math.random() * 10000
    )}`,
    backgroundInfo: "这是一段测试用户的背景信息，用于AI理解用户的需求。",
  };
}

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
        })
      );

      return projectsWithTags;
    })()
  );

  if (result.error) {
    console.error("Failed to get user projects:", result.error);
    return { success: false, error: "Failed to get user projects" };
  }

  return { success: true, data: result.data };
};

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
          error
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

          // Fetch tags for this project
          const tagData = await db
            .select({
              name: tag.name,
            })
            .from(tag)
            .where(eq(tag.projectId, f.projectId));

          // Convert tags to comma-separated string
          const tagsString =
            tagData.length > 0 ? tagData.map((t) => t.name).join(", ") : null;

          return {
            ...projectData[0],
            tags: tagsString, // Add tags as a string
            user: userData.length > 0 ? userData[0] : undefined,
          };
        })
      );

      // Filter out any null values (projects that were deleted)
      return favoriteProjects.filter(
        (project): project is NonNullable<typeof project> => project !== null
      );
    })()
  );

  if (result.error) {
    console.error("Failed to get user favorites:", result.error);
    return { success: false, error: "Failed to get user favorites" };
  }

  return { success: true, data: result.data };
};
