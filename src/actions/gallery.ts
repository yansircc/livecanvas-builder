'use server'

import { and, desc, eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { favorite, like, project, user } from '@/db/schema'
import { getServerSession } from '@/lib/auth-server'

// Get all published projects
export async function getPublishedProjects() {
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

// Get a single project by ID
export async function getProjectById(projectId: string) {
  try {
    const projectData = await db.select().from(project).where(eq(project.id, projectId)).limit(1)

    if (projectData.length === 0) {
      return { success: false, error: 'Project not found' }
    }

    return { success: true, data: projectData[0] }
  } catch (error) {
    console.error('Failed to get project:', error)
    return { success: false, error: 'Failed to get project' }
  }
}

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
        userId: session.user.id,
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
        error: '项目未找到或您没有权限删除它',
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

      revalidatePath('/gallery')
      revalidatePath(`/gallery/${projectId}`)

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

      revalidatePath('/gallery')
      revalidatePath(`/gallery/${projectId}`)

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

      revalidatePath('/gallery')
      revalidatePath(`/gallery/${projectId}`)

      return { success: true, favorited: false }
    } else {
      // Favorite the project
      await db.insert(favorite).values({
        id: nanoid(),
        projectId,
        userId: session.user.id,
        createdAt: new Date(),
      })

      revalidatePath('/gallery')
      revalidatePath(`/gallery/${projectId}`)

      return { success: true, favorited: true }
    }
  } catch (error) {
    console.error('收藏项目失败:', error)
    return { success: false, error: '收藏项目失败' }
  }
}

// Check if user has liked or favorited a project
export async function getUserInteractions(projectId: string) {
  try {
    const session = await getServerSession()
    if (!session) {
      return { success: true, data: { hasLiked: false, hasFavorited: false } }
    }

    const [userLike, userFavorite] = await Promise.all([
      db.query.like.findFirst({
        where: and(eq(like.projectId, projectId), eq(like.userId, session.user.id)),
      }),
      db.query.favorite.findFirst({
        where: and(eq(favorite.projectId, projectId), eq(favorite.userId, session.user.id)),
      }),
    ])

    return {
      success: true,
      data: {
        hasLiked: !!userLike,
        hasFavorited: !!userFavorite,
      },
    }
  } catch (error) {
    console.error('获取用户互动失败:', error)
    return { success: false, error: '获取用户互动失败' }
  }
}

// Get user's favorite projects
export async function getUserFavorites() {
  try {
    const session = await getServerSession()
    if (!session) {
      return { success: false, error: '未授权' }
    }

    // Get the user's favorite project IDs
    const userFavorites = await db
      .select()
      .from(favorite)
      .where(eq(favorite.userId, session.user.id))

    if (userFavorites.length === 0) {
      return { success: true, data: [] }
    }

    // Get the projects for those IDs
    const favoriteProjectIds = userFavorites.map((fav) => fav.projectId)

    // Get projects with user information
    const projectsWithUsers = []
    for (const projectId of favoriteProjectIds) {
      const projectData = await db.select().from(project).where(eq(project.id, projectId)).limit(1)

      if (projectData.length > 0) {
        const p = projectData[0] as typeof project.$inferSelect

        // Get user information
        const userData = await db
          .select({
            id: user.id,
            name: user.name,
            image: user.image,
          })
          .from(user)
          .where(eq(user.id, p.userId))
          .limit(1)

        projectsWithUsers.push({
          ...p,
          user: userData.length > 0 ? userData[0] : undefined,
        })
      }
    }

    return { success: true, data: projectsWithUsers }
  } catch (error) {
    console.error('获取用户收藏失败:', error)
    return { success: false, error: '获取用户收藏失败' }
  }
}

// Get user's projects
export async function getUserProjects() {
  try {
    const session = await getServerSession()
    if (!session) {
      return { success: false, error: '未授权' }
    }

    // Get the user's projects
    const userProjects = await db
      .select()
      .from(project)
      .where(eq(project.userId, session.user.id))
      .orderBy(desc(project.createdAt))

    // Add user information from the session
    const projectsWithUser = userProjects.map((p) => ({
      ...p,
      user: {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image || null,
      },
    }))

    return { success: true, data: projectsWithUser }
  } catch (error) {
    console.error('获取用户项目失败:', error)
    return { success: false, error: '获取用户项目失败' }
  }
}
