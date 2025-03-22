'use client'

import { useEffect, useState } from 'react'
import { getPublishedProjects, getUserFavorites, getUserProjects } from '@/actions/gallery'
import { useAuth } from '@/hooks/use-auth'
import { type Project } from '@/types'
import GalleryClient from './components/gallery-client'

export default function GalleryPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const userId = user?.id

  const [isLoading, setIsLoading] = useState(true)
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [favoriteProjects, setFavoriteProjects] = useState<Project[]>([])
  const [myProjects, setMyProjects] = useState<Project[]>([])

  useEffect(() => {
    async function fetchProjects() {
      setIsLoading(true)
      try {
        // Fetch published projects
        const publishedResult = await getPublishedProjects()
        const published = (publishedResult.data || []) as Project[]
        setAllProjects(published)

        // Fetch user's favorites and projects if authenticated
        if (isAuthenticated && userId) {
          // Get favorites
          const favoritesResult = await getUserFavorites(userId)
          const favorites = favoritesResult.success
            ? ((favoritesResult.data || []).filter(Boolean) as Project[])
            : []
          setFavoriteProjects(favorites)

          // Get user's projects
          const userProjectsResult = await getUserProjects(userId)
          const userProjects = userProjectsResult.success
            ? ((userProjectsResult.data || []) as Project[])
            : []
          setMyProjects(userProjects)
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch projects when auth is done loading
    if (!authLoading) {
      void fetchProjects()
    }
  }, [userId, isAuthenticated, authLoading])

  // Show loading while either auth is loading or projects are loading
  const showLoading = authLoading || isLoading

  return (
    <>
      {showLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
        </div>
      ) : (
        <GalleryClient
          initialAllProjects={allProjects}
          initialFavoriteProjects={favoriteProjects}
          initialMyProjects={myProjects}
          userId={userId}
          isAuthenticated={isAuthenticated}
        />
      )}
    </>
  )
}
