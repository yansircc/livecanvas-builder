import { getPublishedProjects, getUserFavorites, getUserProjects } from '@/actions/gallery'
import { getServerSession } from '@/lib/auth-server'
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

// Create a ProjectsLoader component that loads data and renders the client
async function ProjectsLoader() {
  // Fetch data in parallel with caching
  const [allProjects, favoriteProjects, myProjects] = await Promise.all([
    getProjects(),
    getFavorites(),
    getUserProjectsList(),
  ])

  // Get session for client component
  const session = await getServerSession()

  return (
    <GalleryClient
      initialAllProjects={allProjects}
      initialFavoriteProjects={favoriteProjects}
      initialMyProjects={myProjects}
      hasSession={!!session}
    />
  )
}

export default function GalleryPage() {
  // Let Next.js loading.tsx handle the loading state
  return <ProjectsLoader />
}
