"use server";

import { tryCatch } from "@/lib/try-catch";
import {
  addProjectCacheTags,
  addProjectInteractionCacheTags,
  revalidateProjectInteraction,
} from "@/server/cache";
import { db } from "@/server/db";
import { favorite, project, purchase, user } from "@/server/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

// Get all published projects with caching
export const getPublishedProjects = async () => {
  "use cache";

  addProjectCacheTags("list");

  const result = await tryCatch(
    (async () => {
      // Use a simpler query without relations
      const projects = await db
        .select()
        .from(project)
        .where(eq(project.isPublished, true))
        .orderBy(desc(project.createdAt));

      // Add cache tags for each project
      for (const p of projects) {
        addProjectCacheTags(p.id);
      }

      // Fetch user information for each project
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

          return {
            ...p,
            user: userData.length > 0 ? userData[0] : undefined,
          };
        })
      );

      return projectsWithData;
    })()
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

  addProjectCacheTags(projectId);

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

      return {
        ...projectData[0],
        user: userData.length > 0 ? userData[0] : undefined,
      };
    })()
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

// purchase a project
export async function purchaseProject(projectId: string, userId: string) {
  // Check if the user has already purchased the project
  const { data: existingPurchase, error: findError } = await tryCatch(
    db.query.purchase.findFirst({
      where: and(
        eq(purchase.projectId, projectId),
        eq(purchase.userId, userId)
      ),
    })
  );

  if (findError) {
    console.error("Failed to check existing purchase:", findError);
    return { success: false, error: "操作失败" };
  }

  if (existingPurchase) {
    // Unpurchase the project
    const { error: deleteError } = await tryCatch(
      db.delete(purchase).where(eq(purchase.id, existingPurchase.id))
    );

    if (deleteError) {
      console.error("Failed to delete purchase:", deleteError);
      return { success: false, error: "取消点赞失败" };
    }

    // Decrement the purchases count
    const { error: updateError } = await tryCatch(
      db
        .update(project)
        .set({
          purchaseCount: sql`${project.purchaseCount} - 1`,
        })
        .where(eq(project.id, projectId))
    );

    if (updateError) {
      console.error("Failed to update purchase count:", updateError);
      return { success: false, error: "更新点赞数失败" };
    }

    // Revalidate caches
    revalidateProjectInteraction(projectId, userId, "PURCHASED");

    return { success: true, purchased: false };
  }

  // Purchase the project
  const { error: insertError } = await tryCatch(
    db.insert(purchase).values({
      id: nanoid(),
      projectId,
      userId,
      createdAt: new Date(),
    })
  );

  if (insertError) {
    console.error("Failed to insert purchase:", insertError);
    return { success: false, error: "点赞失败" };
  }

  // Increment the purchases count
  const { error: updateError } = await tryCatch(
    db
      .update(project)
      .set({
        purchaseCount: sql`${project.purchaseCount} + 1`,
      })
      .where(eq(project.id, projectId))
  );

  if (updateError) {
    console.error("Failed to update purchase count:", updateError);
    return { success: false, error: "更新点赞数失败" };
  }

  // Revalidate caches
  revalidateProjectInteraction(projectId, userId, "PURCHASED");

  return { success: true, purchased: true };
}

// Favorite a project
export async function favoriteProject(projectId: string, userId: string) {
  // Check if the user has already favorited the project
  const { data: existingFavorite, error: findError } = await tryCatch(
    db.query.favorite.findFirst({
      where: and(
        eq(favorite.projectId, projectId),
        eq(favorite.userId, userId)
      ),
    })
  );

  if (findError) {
    console.error("Failed to check existing favorite:", findError);
    return { success: false, error: "操作失败" };
  }

  if (existingFavorite) {
    // Unfavorite the project
    const { error: deleteError } = await tryCatch(
      db.delete(favorite).where(eq(favorite.id, existingFavorite.id))
    );

    if (deleteError) {
      console.error("Failed to delete favorite:", deleteError);
      return { success: false, error: "取消收藏失败" };
    }

    // Revalidate caches
    revalidateProjectInteraction(projectId, userId, "FAVORITED");

    return { success: true, favorited: false };
  }

  // Favorite the project
  const { error: insertError } = await tryCatch(
    db.insert(favorite).values({
      id: nanoid(),
      projectId,
      userId,
      createdAt: new Date(),
    })
  );

  if (insertError) {
    console.error("Failed to insert favorite:", insertError);
    return { success: false, error: "收藏失败" };
  }

  // Revalidate caches
  revalidateProjectInteraction(projectId, userId, "FAVORITED");

  return { success: true, favorited: true };
}

// Cache user interactions for better performance
export const getUserInteractions = async (
  projectId: string,
  userId: string
) => {
  const result = await tryCatch(
    (async () => {
      // Check if the user has purchased the project
      const userpurchase = await db.query.purchase.findFirst({
        where: and(
          eq(purchase.projectId, projectId),
          eq(purchase.userId, userId)
        ),
      });

      // Check if the user has favorited the project
      const userFavorite = await db.query.favorite.findFirst({
        where: and(
          eq(favorite.projectId, projectId),
          eq(favorite.userId, userId)
        ),
      });

      return {
        hasPurchased: !!userpurchase,
        hasFavorited: !!userFavorite,
      };
    })()
  );

  if (result.error) {
    console.error("Failed to get user interactions:", result.error);
    return { success: false, error: "Failed to get user interactions" };
  }

  return { success: true, data: result.data };
};

// Get all user interactions for multiple projects
export const getAllUserInteractions = async (userId: string) => {
  "use cache";

  addProjectInteractionCacheTags(userId, userId, "PURCHASED");
  addProjectInteractionCacheTags(userId, userId, "FAVORITED");

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
    })()
  );

  if (result.error) {
    console.error("Failed to get all user interactions:", result.error);
    return { success: false, error: "Failed to get all user interactions" };
  }

  return { success: true, data: result.data };
};
