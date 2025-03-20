import { cache } from 'react'
import { getPublishedProjects, getUserFavorites, getUserProjects } from '@/actions/gallery'
import { getServerSession } from '@/lib/auth-server'
import { type Project } from '@/types'
import GalleryClient from './components/gallery-client'

// Remove force-dynamic to allow caching
// export const dynamic = 'force-dynamic'

// Add caching to data fetching functions
const getProjects = cache(async () => {
  // Use fetch with Next.js caching
  const publishedResult = await getPublishedProjects()
  return (publishedResult.data || []) as Project[]
})

const getFavorites = cache(async () => {
  const session = await getServerSession()
  if (!session) return [] as Project[]

  const favoritesResult = await getUserFavorites()
  // Explicitly filter out any null values from favorites and cast to Project[]
  const favorites = favoritesResult.success
    ? ((favoritesResult.data || []).filter(Boolean) as Project[])
    : ([] as Project[])
  return favorites
})

const getUserProjectsList = cache(async () => {
  const session = await getServerSession()
  if (!session) return [] as Project[]

  const userProjectsResult = await getUserProjects()
  return userProjectsResult.success
    ? ((userProjectsResult.data || []) as Project[])
    : ([] as Project[])
})

// Add cache configuration
export const revalidate = 60 // Revalidate at most once per minute

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
