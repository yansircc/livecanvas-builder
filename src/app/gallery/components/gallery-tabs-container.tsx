'use server'

import { getAllUserInteractions, getPublishedProjects } from '@/actions/gallery'
import { getServerSession } from '@/lib/auth-server'
import { ClientGalleryTabs } from './client-gallery-tabs'

interface UserInteraction {
  hasLiked: boolean
  hasFavorited: boolean
}

/**
 * Server component that fetches projects and user data
 * Uses RSC for efficient data fetching and initial state preparation
 */
export async function GalleryTabsContainer() {
  // Get user session in parallel with data fetching
  const sessionPromise = getServerSession()
  const projectsPromise = getPublishedProjects()

  // Wait for all data to be fetched
  const [session, publishedResult] = await Promise.all([sessionPromise, projectsPromise])

  // Extract user info
  const userId = session?.user?.id
  const isAuthenticated = !!userId

  // Extract projects with fallback to empty array
  const allProjects = publishedResult.success ? publishedResult.data || [] : []

  // Fetch user interactions if authenticated
  let userInteractions: Record<string, UserInteraction> = {}
  if (isAuthenticated && userId) {
    const interactionsResult = await getAllUserInteractions(userId)
    if (interactionsResult.success) {
      userInteractions = interactionsResult.data || {}
    }
  }

  // Pre-compute interactions map using project IDs, including user's actual interactions
  const interactions = Object.fromEntries(
    allProjects
      .filter((project) => project?.id)
      .map((project) => [
        project.id,
        userInteractions[project.id] || { hasLiked: false, hasFavorited: false },
      ]),
  )

  return (
    <ClientGalleryTabs
      initialProjects={allProjects}
      initialInteractions={interactions}
      userId={userId}
      isAuthenticated={isAuthenticated}
    />
  )
}
