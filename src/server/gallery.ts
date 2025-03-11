'use server'

import { and, desc, eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { favorite, like, project, user } from '@/server/db/schema'

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
  isPublished: boolean
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
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

// Update a project
export async function updateProject(
  projectId: string,
  data: {
    title?: string
    description?: string
    htmlContent?: string
    thumbnail?: string
    isPublished?: boolean
  },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if the user owns the project
    const existingProject = await db.query.project.findFirst({
      where: eq(project.id, projectId),
    })

    if (!existingProject) {
      return { success: false, error: 'Project not found' }
    }

    if (existingProject.userId !== session.user.id) {
      return { success: false, error: 'Not authorized to update this project' }
    }

    const updatedProject = await db
      .update(project)
      .set({
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.htmlContent && { htmlContent: data.htmlContent }),
        ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
        updatedAt: new Date(),
      })
      .where(eq(project.id, projectId))
      .returning()

    revalidatePath('/gallery')
    revalidatePath(`/gallery/${projectId}`)

    return { success: true, data: updatedProject[0] }
  } catch (error) {
    console.error('Failed to update project:', error)
    return { success: false, error: 'Failed to update project' }
  }
}

// Delete a project
export async function deleteProject(projectId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if the user owns the project
    const existingProject = await db.query.project.findFirst({
      where: eq(project.id, projectId),
    })

    if (!existingProject) {
      return { success: false, error: 'Project not found' }
    }

    if (existingProject.userId !== session.user.id) {
      return { success: false, error: 'Not authorized to delete this project' }
    }

    await db.delete(project).where(eq(project.id, projectId))

    revalidatePath('/gallery')

    return { success: true }
  } catch (error) {
    console.error('Failed to delete project:', error)
    return { success: false, error: 'Failed to delete project' }
  }
}

// Like a project
export async function likeProject(projectId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session) {
      return { success: false, error: 'Not authenticated' }
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
    console.error('Failed to like project:', error)
    return { success: false, error: 'Failed to like project' }
  }
}

// Favorite a project
export async function favoriteProject(projectId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session) {
      return { success: false, error: 'Not authenticated' }
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
    console.error('Failed to favorite project:', error)
    return { success: false, error: 'Failed to favorite project' }
  }
}

// Check if user has liked or favorited a project
export async function getUserInteractions(projectId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
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
    console.error('Failed to get user interactions:', error)
    return { success: false, error: 'Failed to get user interactions' }
  }
}

// Get user's favorite projects
export async function getUserFavorites() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session) {
      return { success: false, error: 'Not authenticated' }
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
    console.error('Failed to get user favorites:', error)
    return { success: false, error: 'Failed to get user favorites' }
  }
}

// Get user's projects
export async function getUserProjects() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })
    if (!session) {
      return { success: false, error: 'Not authenticated' }
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
    console.error('Failed to get user projects:', error)
    return { success: false, error: 'Failed to get user projects' }
  }
}
