// Create a server component for data fetching with caching
import { Suspense } from 'react'
import { getPublishedProjects, getUserFavorites, getUserProjects } from '@/actions/gallery'
import { getServerSession } from '@/lib/auth-server'
import { type Project } from '@/types'
import GalleryClient from './components/gallery-client'

// Configure page options for caching
export const dynamic = 'force-dynamic'

// Add caching to data fetching functions
async function getProjects() {
  // Use Next.js cache for data fetching
  const publishedResult = await getPublishedProjects()
  return publishedResult.data || []
}

async function getFavorites() {
  const session = await getServerSession()
  if (!session) return []

  const favoritesResult = await getUserFavorites()
  return favoritesResult.success ? favoritesResult.data || [] : []
}

async function getUserProjectsList() {
  const session = await getServerSession()
  if (!session) return []

  const userProjectsResult = await getUserProjects()
  return userProjectsResult.success ? userProjectsResult.data || [] : []
}

// Add cache configuration using metadata export
export const metadata = {
  revalidate: 60, // Revalidate at most once per minute
}

export default async function GalleryPage() {
  // Fetch data in parallel with caching
  const [allProjects, favoriteProjects, myProjects] = await Promise.all([
    getProjects(),
    getFavorites(),
    getUserProjectsList(),
  ])

  // Get session for client component
  const session = await getServerSession()

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          Loading...
        </div>
      }
    >
      <GalleryClient
        initialAllProjects={allProjects}
        initialFavoriteProjects={favoriteProjects}
        initialMyProjects={myProjects}
        hasSession={!!session}
      />
    </Suspense>
  )
}
