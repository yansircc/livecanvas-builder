'use server'

import { and, desc, eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { favorite, like, project, user } from '@/db/schema'
import { deleteFromVercelBlob } from '@/lib/vercel-blob'

// Get all published projects with caching
export const getPublishedProjects = async () => {
  try {
    // Use a simpler query without relations
    const projects = await db
      .select()
      .from(project)
      .where(eq(project.isPublished, true))
      .orderBy(desc(project.createdAt))

    // Fetch user information for each project
    const projectsWithUsers = await Promise.all(
      projects.map(async (p) => {
        const userData = await db
          .select({
            id: user.id,
            name: user.name,
            image: user.image,
          })
          .from(user)
          .where(eq(user.id, p.userId))
          .limit(1)

        return {
          ...p,
          user: userData.length > 0 ? userData[0] : undefined,
        }
      }),
    )

    return { success: true, data: projectsWithUsers }
  } catch (error) {
    console.error('Failed to get published projects:', error)
    return { success: false, error: 'Failed to get published projects' }
  }
}

// Get a single project by ID with caching
export const getProjectById = async (projectId: string) => {
  try {
    const projectData = await db.select().from(project).where(eq(project.id, projectId)).limit(1)

    if (projectData.length === 0 || !projectData[0]) {
      return { success: false, error: 'Project not found' }
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
      .limit(1)

    const projectWithUser = {
      ...projectData[0],
      user: userData.length > 0 ? userData[0] : undefined,
    }

    return { success: true, data: projectWithUser }
  } catch (error) {
    console.error('Failed to get project:', error)
    return { success: false, error: 'Failed to get project' }
  }
}

// Create a new project
export async function createProject(
  userId: string | undefined,
  data: {
    title: string
    description?: string
    htmlContent: string
    thumbnail?: string
    tags?: string
    isPublished: boolean
    projectId?: string
  },
) {
  if (!userId) {
    return { success: false, error: '请先登录' }
  }

  try {
    // Use provided projectId or generate a new one
    const projectId = data.projectId || nanoid()

    const newProject = await db
      .insert(project)
      .values({
        id: projectId,
        title: data.title,
        description: data.description || '',
        htmlContent: data.htmlContent,
        thumbnail: data.thumbnail || '',
        tags: data.tags || '',
        isPublished: data.isPublished,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    revalidatePath('/gallery')

    if (data.isPublished) {
      return { success: true, data: newProject[0], redirect: '/gallery' }
    } else {
      return { success: true, data: newProject[0] }
    }
  } catch (error) {
    console.error('Failed to create project:', error)
    return { success: false, error: 'Failed to create project' }
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
    title?: string
    description?: string | null
    tags?: string | null
    isPublished?: boolean
  },
) {
  try {
    // Get the project to verify ownership
    const existingProject = await db.query.project.findFirst({
      where: and(eq(project.id, projectId), eq(project.userId, userId)),
    })

    if (!existingProject) {
      return {
        success: false,
        error: 'Project not found or you do not have permission to update it',
      }
    }

    // Update the project
    await db
      .update(project)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(project.id, projectId))

    return { success: true }
  } catch (error) {
    console.error('Failed to update project:', error)
    return { success: false, error: 'Failed to update project' }
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
    })

    if (!existingProject) {
      return {
        success: false,
        error: '项目未找到或你没有权限删除它',
      }
    }

    // Delete the thumbnail if it exists
    if (existingProject.thumbnail && existingProject.thumbnail.includes('vercel-storage.com')) {
      try {
        // Parse the URL to get the path
        const urlObj = new URL(existingProject.thumbnail)
        const path = urlObj.pathname

        if (path) {
          await deleteFromVercelBlob(path)
          console.log(`Deleted thumbnail for project ${projectId}`)
        }
      } catch (error) {
        // Log error but continue with project deletion
        console.error(`Failed to delete thumbnail for project ${projectId}:`, error)
      }
    }

    // Delete the project
    await db.delete(project).where(eq(project.id, projectId))

    return { success: true }
  } catch (error) {
    console.error('删除项目失败:', error)
    return { success: false, error: '删除项目失败' }
  }
}

// Like a project
export async function likeProject(projectId: string, userId: string) {
  try {
    // Check if the user has already liked the project
    const existingLike = await db.query.like.findFirst({
      where: and(eq(like.projectId, projectId), eq(like.userId, userId)),
    })

    if (existingLike) {
      // Unlike the project
      await db.delete(like).where(eq(like.id, existingLike.id))

      // Decrement the likes count
      await db
        .update(project)
        .set({
          likesCount: sql`${project.likesCount} - 1`,
        })
        .where(eq(project.id, projectId))

      return { success: true, liked: false }
    } else {
      // Like the project
      await db.insert(like).values({
        id: nanoid(),
        projectId,
        userId,
        createdAt: new Date(),
      })

      // Increment the likes count
      await db
        .update(project)
        .set({
          likesCount: sql`${project.likesCount} + 1`,
        })
        .where(eq(project.id, projectId))

      return { success: true, liked: true }
    }
  } catch (error) {
    console.error('点赞项目失败:', error)
    return { success: false, error: '点赞项目失败' }
  }
}

// Favorite a project
export async function favoriteProject(projectId: string, userId: string) {
  try {
    // Check if the user has already favorited the project
    const existingFavorite = await db.query.favorite.findFirst({
      where: and(eq(favorite.projectId, projectId), eq(favorite.userId, userId)),
    })

    if (existingFavorite) {
      // Unfavorite the project
      await db.delete(favorite).where(eq(favorite.id, existingFavorite.id))

      return { success: true, favorited: false }
    } else {
      // Favorite the project
      await db.insert(favorite).values({
        id: nanoid(),
        projectId,
        userId,
        createdAt: new Date(),
      })

      return { success: true, favorited: true }
    }
  } catch (error) {
    console.error('收藏项目失败:', error)
    return { success: false, error: '收藏项目失败' }
  }
}

// Cache user interactions for better performance
export const getUserInteractions = async (projectId: string, userId: string) => {
  try {
    // Check if the user has liked the project
    const userLike = await db.query.like.findFirst({
      where: and(eq(like.projectId, projectId), eq(like.userId, userId)),
    })

    // Check if the user has favorited the project
    const userFavorite = await db.query.favorite.findFirst({
      where: and(eq(favorite.projectId, projectId), eq(favorite.userId, userId)),
    })

    return {
      success: true,
      data: {
        hasLiked: !!userLike,
        hasFavorited: !!userFavorite,
      },
    }
  } catch (error) {
    console.error('Failed to get user interactions:', error)
    return { success: false, error: 'Failed to get user interactions' }
  }
}

// Cache user favorites for better performance
export const getUserFavorites = async (userId: string) => {
  try {
    // Get the user's favorites
    const userFavorites = await db
      .select({
        projectId: favorite.projectId,
      })
      .from(favorite)
      .where(eq(favorite.userId, userId))

    // Get the details of each favorited project
    const favoriteProjects = await Promise.all(
      userFavorites.map(async (f) => {
        const projectData = await db
          .select()
          .from(project)
          .where(eq(project.id, f.projectId))
          .limit(1)

        if (projectData.length === 0 || !projectData[0]) return null

        // Fetch user information
        const userData = await db
          .select({
            id: user.id,
            name: user.name,
            image: user.image,
          })
          .from(user)
          .where(eq(user.id, projectData[0].userId))
          .limit(1)

        return {
          ...projectData[0],
          user: userData.length > 0 ? userData[0] : undefined,
        }
      }),
    )

    // Filter out any null values (projects that were deleted)
    const validFavorites = favoriteProjects.filter(
      (project): project is NonNullable<typeof project> => project !== null,
    )

    return { success: true, data: validFavorites }
  } catch (error) {
    console.error('Failed to get user favorites:', error)
    return { success: false, error: 'Failed to get user favorites' }
  }
}

// Cache user projects for better performance
export const getUserProjects = async (userId: string | undefined) => {
  if (!userId) {
    return { success: false, error: '请先登录' }
  }

  try {
    // Get the user's projects
    const userProjects = await db
      .select()
      .from(project)
      .where(eq(project.userId, userId))
      .orderBy(desc(project.createdAt))

    // Add user information to each project
    const projectsWithUser = userProjects.map((p) => ({
      ...p,
      user: {
        id: userId,
        name: '',
        image: null,
      },
    }))

    return { success: true, data: projectsWithUser }
  } catch (error) {
    console.error('Failed to get user projects:', error)
    return { success: false, error: 'Failed to get user projects' }
  }
}

// Get all user interactions for multiple projects
export const getAllUserInteractions = async (userId: string) => {
  try {
    // Get all user likes
    const userLikes = await db
      .select({
        projectId: like.projectId,
      })
      .from(like)
      .where(eq(like.userId, userId))

    // Get all user favorites
    const userFavorites = await db
      .select({
        projectId: favorite.projectId,
      })
      .from(favorite)
      .where(eq(favorite.userId, userId))

    // Create a map of project interactions
    const interactionsMap: Record<string, { hasLiked: boolean; hasFavorited: boolean }> = {}

    // Add likes to map - use loop with explicit type checking
    for (const item of userLikes) {
      const projectId = item.projectId
      if (typeof projectId === 'string') {
        if (!interactionsMap[projectId]) {
          interactionsMap[projectId] = { hasLiked: false, hasFavorited: false }
        }
        interactionsMap[projectId].hasLiked = true
      }
    }

    // Add favorites to map - use loop with explicit type checking
    for (const item of userFavorites) {
      const projectId = item.projectId
      if (typeof projectId === 'string') {
        if (!interactionsMap[projectId]) {
          interactionsMap[projectId] = { hasLiked: false, hasFavorited: false }
        }
        interactionsMap[projectId].hasFavorited = true
      }
    }

    return {
      success: true,
      data: interactionsMap,
    }
  } catch (error) {
    console.error('Failed to get all user interactions:', error)
    return { success: false, error: 'Failed to get all user interactions' }
  }
}
