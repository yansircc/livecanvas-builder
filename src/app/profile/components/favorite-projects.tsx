'use client'

import { Eye, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { getUserFavorites } from '@/actions/gallery'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { type Project } from '@/types'

interface FavoriteProjectsProps {
  userId: string
}

export function FavoriteProjects({ userId }: FavoriteProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Load favorite projects
  useEffect(() => {
    async function loadFavorites() {
      setIsLoading(true)
      try {
        if (!userId) {
          toast.error('Please log in')
          return
        }

        const result = await getUserFavorites(userId)
        if (result.success) {
          setProjects(result.data || [])
        } else {
          toast.error('Failed to load favorites')
        }
      } catch (error) {
        console.error('Failed to load favorites:', error)
        toast.error('Failed to load favorites')
      } finally {
        setIsLoading(false)
      }
    }

    void loadFavorites()
  }, [userId])

  // Filter projects based on search query
  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description &&
        project.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // View project in gallery
  const handleViewProject = (projectId: string) => {
    window.open(`/gallery?project=${projectId}`, '_blank')
  }

  return (
    <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <CardHeader>
        <CardTitle>Favorite Projects</CardTitle>
        <CardDescription>Browse your favorite projects from the gallery</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search input */}
        <div>
          <div className="relative max-w-md">
            <Input
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-zinc-200 bg-white pr-10 dark:border-zinc-700 dark:bg-zinc-800"
            />
            <svg
              className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-zinc-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </div>

        {/* Projects list */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden border-zinc-200 dark:border-zinc-800">
                <div className="aspect-video w-full">
                  <Skeleton className="h-full w-full" />
                </div>
                <CardContent className="p-4">
                  <Skeleton className="mb-2 h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="mt-1 h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-zinc-50 py-12 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <svg
                className="h-6 w-6 text-zinc-500 dark:text-zinc-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
              No favorites found
            </h3>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">
              {searchQuery
                ? 'Try a different search term'
                : 'Save projects from the gallery to see them here'}
            </p>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground mt-4"
              onClick={() => (window.location.href = '/gallery')}
            >
              Browse Gallery
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="overflow-hidden border-zinc-200 dark:border-zinc-800"
              >
                <div className="relative aspect-video w-full">
                  <Image
                    src={
                      project.thumbnail ||
                      'https://images.unsplash.com/photo-1618788372246-79faff0c3742?q=80&w=2070&auto=format&fit=crop'
                    }
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="line-clamp-1 font-medium text-zinc-900 dark:text-zinc-100">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onClick={() => handleViewProject(project.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-2 flex items-center">
                    <div className="flex items-center space-x-2">
                      <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                        {project.user?.image ? (
                          <Image
                            src={project.user.image}
                            alt={project.user?.name || 'User'}
                            width={24}
                            height={24}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            {project.user?.name ? project.user.name.charAt(0).toUpperCase() : 'U'}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {project.user?.name || 'Unknown User'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
