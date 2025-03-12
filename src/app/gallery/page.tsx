'use client'

import { AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSession } from '@/lib/auth-client'
import {
  favoriteProject,
  getPublishedProjects,
  getUserFavorites,
  getUserInteractions,
  getUserProjects,
  likeProject,
} from '@/server/gallery'
import { GalleryHeader } from './components/gallery-header'
import { ProjectModal } from './components/project-modal'
import { TabContentAll } from './components/tab-content-all'
import { TabContentFavorites } from './components/tab-content-favorites'
import { TabContentMyProjects } from './components/tab-content-my-projects'
import { type Project } from './types'

export default function GalleryPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [favoriteProjects, setFavoriteProjects] = useState<Project[]>([])
  const [myProjects, setMyProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectInteractions, setProjectInteractions] = useState<
    Record<string, { hasLiked: boolean; hasFavorited: boolean }>
  >({})

  // Extract all unique tags from projects
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()

    // Function to process tags from a project
    const processTags = (project: Project) => {
      if (project.tags) {
        project.tags.split(',').forEach((tag) => {
          const trimmedTag = tag.trim()
          if (trimmedTag) tagSet.add(trimmedTag)
        })
      }
    }

    // Process tags from all project lists
    allProjects.forEach(processTags)
    favoriteProjects.forEach(processTags)
    myProjects.forEach(processTags)

    return Array.from(tagSet).sort()
  }, [allProjects, favoriteProjects, myProjects])

  // Load projects on mount
  useEffect(() => {
    async function loadProjects() {
      setIsLoading(true)
      try {
        const [publishedResult, favoritesResult, userProjectsResult] = await Promise.all([
          getPublishedProjects(),
          session ? getUserFavorites() : { success: true, data: [] },
          session ? getUserProjects() : { success: true, data: [] },
        ])

        if (publishedResult.success) {
          setAllProjects(publishedResult.data || [])

          // Load interactions for all projects
          const interactions: Record<string, { hasLiked: boolean; hasFavorited: boolean }> = {}

          if (session) {
            await Promise.all(
              (publishedResult.data || []).map(async (project) => {
                const result = await getUserInteractions(project.id)
                if (result.success) {
                  interactions[project.id] = result.data || { hasLiked: false, hasFavorited: false }
                }
              }),
            )
          }

          setProjectInteractions(interactions)
        }

        if (favoritesResult.success) {
          setFavoriteProjects(favoritesResult.data || [])
        }

        if (userProjectsResult.success) {
          setMyProjects(userProjectsResult.data || [])
        }
      } catch (error) {
        console.error('Failed to load projects:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void loadProjects()
  }, [session])

  // Filter projects based on search query and selected tags
  const filterProjects = useCallback(
    (projects: Project[]) => {
      const query = searchQuery.toLowerCase()

      return projects.filter((project) => {
        // Filter by search query
        const matchesQuery =
          !query ||
          project.title.toLowerCase().includes(query) ||
          (project.description && project.description.toLowerCase().includes(query))

        // Filter by tags
        const matchesTags =
          selectedTags.length === 0 ||
          (project.tags &&
            selectedTags.every((tag) =>
              project
                .tags!.split(',')
                .map((t) => t.trim())
                .includes(tag),
            ))

        return matchesQuery && matchesTags
      })
    },
    [searchQuery, selectedTags],
  )

  // Apply filters to each project list
  const filteredProjects = useMemo(() => filterProjects(allProjects), [allProjects, filterProjects])
  const filteredFavorites = useMemo(
    () => filterProjects(favoriteProjects),
    [favoriteProjects, filterProjects],
  )
  const filteredUserProjects = useMemo(
    () => filterProjects(myProjects),
    [filterProjects, myProjects],
  )

  // Handle like project
  const handleLikeProject = async (projectId: string) => {
    if (!session) {
      router.push('/signin')
      return
    }

    try {
      const result = await likeProject(projectId)
      if (result.success) {
        // Update local state
        setProjectInteractions((prev) => {
          const current = prev[projectId] || { hasLiked: false, hasFavorited: false }
          const newState = {
            ...prev,
            [projectId]: {
              hasLiked: result.liked,
              hasFavorited: current.hasFavorited,
            },
          }
          return newState as Record<string, { hasLiked: boolean; hasFavorited: boolean }>
        })

        // Update like count in projects
        setAllProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  likesCount: result.liked ? Number(p.likesCount) + 1 : Number(p.likesCount) - 1,
                }
              : p,
          ),
        )

        setFavoriteProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  likesCount: result.liked ? Number(p.likesCount) + 1 : Number(p.likesCount) - 1,
                }
              : p,
          ),
        )

        setMyProjects((prev) =>
          prev.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  likesCount: result.liked ? Number(p.likesCount) + 1 : Number(p.likesCount) - 1,
                }
              : p,
          ),
        )

        // Update selected project if open
        if (selectedProject && selectedProject.id === projectId) {
          setSelectedProject({
            ...selectedProject,
            likesCount: result.liked
              ? Number(selectedProject.likesCount) + 1
              : Number(selectedProject.likesCount) - 1,
          })
        }
      }
    } catch (error) {
      console.error('Failed to like project:', error)
    }
  }

  // Handle favorite project
  const handleFavoriteProject = async (projectId: string) => {
    if (!session) {
      router.push('/signin')
      return
    }

    try {
      const result = await favoriteProject(projectId)
      if (result.success) {
        // Update local state
        setProjectInteractions((prev) => {
          const current = prev[projectId] || { hasLiked: false, hasFavorited: false }
          const newState = {
            ...prev,
            [projectId]: {
              hasLiked: current.hasLiked,
              hasFavorited: result.favorited,
            },
          }
          return newState as Record<string, { hasLiked: boolean; hasFavorited: boolean }>
        })

        // Update favorites list
        if (result.favorited) {
          const project =
            allProjects.find((p) => p.id === projectId) ||
            myProjects.find((p) => p.id === projectId)
          if (project && !favoriteProjects.some((p) => p.id === projectId)) {
            setFavoriteProjects((prev) => [...prev, project])
          }
        } else {
          setFavoriteProjects((prev) => prev.filter((p) => p.id !== projectId))
        }
      }
    } catch (error) {
      console.error('Failed to favorite project:', error)
    }
  }

  // Handle copy code
  const handleCopyCode = () => {
    // Just log the action, visual feedback is handled in the component
    console.log('Code copied to clipboard')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <main className="container mx-auto px-6 py-8">
        <GalleryHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          availableTags={availableTags}
        />

        <div className="mt-6">
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">所有项目</TabsTrigger>
              <TabsTrigger value="favorites">收藏</TabsTrigger>
              <TabsTrigger value="my-projects">我的项目</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <TabContentAll
                isLoading={isLoading}
                projects={filteredProjects}
                viewMode={viewMode}
                interactions={projectInteractions}
                onSelect={setSelectedProject}
                onLike={handleLikeProject}
                onFavorite={handleFavoriteProject}
              />
            </TabsContent>
            <TabsContent value="favorites" className="mt-6">
              <TabContentFavorites
                isLoading={isLoading}
                projects={filteredFavorites}
                viewMode={viewMode}
                interactions={projectInteractions}
                onSelect={setSelectedProject}
                onLike={handleLikeProject}
                onFavorite={handleFavoriteProject}
              />
            </TabsContent>
            <TabsContent value="my-projects" className="mt-6">
              <TabContentMyProjects
                isLoading={isLoading}
                projects={filteredUserProjects}
                viewMode={viewMode}
                interactions={projectInteractions}
                onSelect={setSelectedProject}
                onLike={handleLikeProject}
                onFavorite={handleFavoriteProject}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            hasLiked={projectInteractions[selectedProject.id]?.hasLiked || false}
            hasFavorited={projectInteractions[selectedProject.id]?.hasFavorited || false}
            onLike={handleLikeProject}
            onFavorite={handleFavoriteProject}
            onCopyCode={handleCopyCode}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
