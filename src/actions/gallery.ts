'use server'

import { and, desc, eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { cache } from 'react'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { favorite, like, project, user } from '@/db/schema'
import { getServerSession } from '@/lib/auth-server'

// Get all published projects with caching
export const getPublishedProjects = cache(async () => {
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
})

// Get a single project by ID with caching
export const getProjectById = cache(async (projectId: string) => {
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
})

// Create a new project
export async function createProject(data: {
  title: string
  description?: string
  htmlContent: string
  thumbnail?: string
  tags?: string
  isPublished: boolean
}) {
  try {
    // 获取会话以获取用户ID用于创建项目
    // 注意: 这里仍然需要验证逻辑，因为服务器操作不经过中间件
    const session = await getServerSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const newProject = await db
      .insert(project)
      .values({
        id: nanoid(),
        title: data.title,
        description: data.description || '',
        htmlContent: data.htmlContent,
        thumbnail: data.thumbnail || '',
        tags: data.tags || '',
        isPublished: data.isPublished,
        userId: session.user.id, // 使用用户ID关联项目
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
  data: {
    title?: string
    description?: string | null
    tags?: string | null
    isPublished?: boolean
  },
) {
  try {
    // 获取会话以获取用户ID用于验证项目所有权
    // 注意: 这里仍然需要验证逻辑，因为服务器操作不经过中间件
    const session = await getServerSession()
    if (!session) {
      return { success: false, error: 'Unauthorized' }
    }

    // Get the project to verify ownership
    const existingProject = await db.query.project.findFirst({
      where: and(eq(project.id, projectId), eq(project.userId, session.user.id)),
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
export async function deleteProject(projectId: string) {
  try {
    const session = await getServerSession()
    if (!session) {
      return { success: false, error: '未授权' }
    }

    // Get the project to verify ownership
    const existingProject = await db.query.project.findFirst({
      where: and(eq(project.id, projectId), eq(project.userId, session.user.id)),
    })

    if (!existingProject) {
      return {
        success: false,
        error: '项目未找到或你没有权限删除它',
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
export async function likeProject(projectId: string) {
  try {
    const session = await getServerSession()
    if (!session) {
      return { success: false, error: '未授权' }
    }

    // Check if the user has already liked the project
    const existingLike = await db.query.like.findFirst({
      where: and(eq(like.projectId, projectId), eq(like.userId, session.user.id)),
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
        userId: session.user.id,
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
export async function favoriteProject(projectId: string) {
  try {
    const session = await getServerSession()
    if (!session) {
      return { success: false, error: '未授权' }
    }

    // Check if the user has already favorited the project
    const existingFavorite = await db.query.favorite.findFirst({
      where: and(eq(favorite.projectId, projectId), eq(favorite.userId, session.user.id)),
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
        userId: session.user.id,
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
export const getUserInteractions = cache(async (projectId: string) => {
  try {
    // 获取会话以获取用户ID用于查询互动数据
    // 注意: 这里仍然需要验证逻辑，因为服务器操作不经过中间件
    const session = await getServerSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if the user has liked the project
    const userLike = await db.query.like.findFirst({
      where: and(eq(like.projectId, projectId), eq(like.userId, session.user.id)),
    })

    // Check if the user has favorited the project
    const userFavorite = await db.query.favorite.findFirst({
      where: and(eq(favorite.projectId, projectId), eq(favorite.userId, session.user.id)),
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
})

// Cache user favorites for better performance
export const getUserFavorites = cache(async () => {
  try {
    const session = await getServerSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get the user's favorites
    const userFavorites = await db
      .select({
        projectId: favorite.projectId,
      })
      .from(favorite)
      .where(eq(favorite.userId, session.user.id))

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
})

// Cache user projects for better performance
export const getUserProjects = cache(async () => {
  try {
    const session = await getServerSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get the user's projects
    const userProjects = await db
      .select()
      .from(project)
      .where(eq(project.userId, session.user.id))
      .orderBy(desc(project.createdAt))

    // Add user information to each project
    const projectsWithUser = userProjects.map((p) => ({
      ...p,
      user: {
        id: session.user.id,
        name: session.user.name || '',
        image: session.user.image || null,
      },
    }))

    return { success: true, data: projectsWithUser }
  } catch (error) {
    console.error('Failed to get user projects:', error)
    return { success: false, error: 'Failed to get user projects' }
  }
})
