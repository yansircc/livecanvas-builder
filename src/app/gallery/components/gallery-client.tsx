'use client'

import { AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { favoriteProject, getUserInteractions, likeProject } from '@/actions/gallery'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSession } from '@/lib/auth-client'
import { type Project } from '@/types'
import { GalleryHeader } from './gallery-header'
import { ProjectModal } from './project-modal'
import { TabContentAll } from './tab-content-all'
import { TabContentFavorites } from './tab-content-favorites'
import { TabContentMyProjects } from './tab-content-my-projects'

interface GalleryClientProps {
  initialAllProjects: Project[]
  initialFavoriteProjects: Project[]
  initialMyProjects: Project[]
  hasSession: boolean
}

export default function GalleryClient({
  initialAllProjects,
  initialFavoriteProjects,
  initialMyProjects,
}: GalleryClientProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const [allProjects, setAllProjects] = useState<Project[]>(initialAllProjects)
  const [favoriteProjects, setFavoriteProjects] = useState<Project[]>(initialFavoriteProjects)
  const [myProjects, setMyProjects] = useState<Project[]>(initialMyProjects)
  const [isLoading, setIsLoading] = useState(false)

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

  // Load user interactions on mount
  useEffect(() => {
    async function loadInteractions() {
      if (!session) return

      setIsLoading(true)
      try {
        const interactions: Record<string, { hasLiked: boolean; hasFavorited: boolean }> = {}

        await Promise.all(
          initialAllProjects.map(async (project) => {
            const result = await getUserInteractions(project.id)
            if (result.success) {
              interactions[project.id] = result.data || { hasLiked: false, hasFavorited: false }
            }
          }),
        )

        setProjectInteractions(interactions)
      } catch (error) {
        console.error('Failed to load interactions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void loadInteractions()
  }, [session, initialAllProjects])

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

  // Handle like project with optimistic updates
  const handleLikeProject = async (projectId: string, event?: React.MouseEvent) => {
    // Prevent event propagation if called from within modal
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    if (!session) {
      router.push('/signin')
      return
    }

    // Get current state
    const currentInteraction = projectInteractions[projectId] || {
      hasLiked: false,
      hasFavorited: false,
    }
    const isCurrentlyLiked = currentInteraction.hasLiked

    // Apply optimistic update
    setProjectInteractions((prev) => ({
      ...prev,
      [projectId]: {
        ...currentInteraction,
        hasLiked: !isCurrentlyLiked,
      },
    }))

    // Update like count in projects optimistically
    const updateLikeCount = (projects: Project[]) =>
      projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              likesCount: !isCurrentlyLiked
                ? Number(p.likesCount) + 1
                : Math.max(0, Number(p.likesCount) - 1),
            }
          : p,
      )

    setAllProjects(updateLikeCount)
    setFavoriteProjects(updateLikeCount)
    setMyProjects(updateLikeCount)

    // Update selected project if open
    if (selectedProject && selectedProject.id === projectId) {
      setSelectedProject({
        ...selectedProject,
        likesCount: !isCurrentlyLiked
          ? Number(selectedProject.likesCount) + 1
          : Math.max(0, Number(selectedProject.likesCount) - 1),
      })
    }

    try {
      // Make the actual API call
      const result = await likeProject(projectId)

      if (!result.success) {
        // Revert optimistic update if the API call fails
        setProjectInteractions((prev) => ({
          ...prev,
          [projectId]: {
            ...currentInteraction,
            hasLiked: isCurrentlyLiked,
          },
        }))

        // Revert like count
        const revertLikeCount = (projects: Project[]) =>
          projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  likesCount: isCurrentlyLiked
                    ? Number(p.likesCount)
                    : Math.max(0, Number(p.likesCount) - 1),
                }
              : p,
          )

        setAllProjects(revertLikeCount)
        setFavoriteProjects(revertLikeCount)
        setMyProjects(revertLikeCount)

        // Revert selected project if open
        if (selectedProject && selectedProject.id === projectId) {
          setSelectedProject({
            ...selectedProject,
            likesCount: isCurrentlyLiked
              ? Number(selectedProject.likesCount)
              : Math.max(0, Number(selectedProject.likesCount) - 1),
          })
        }
      }
    } catch (error) {
      console.error('Failed to like project:', error)

      // Revert optimistic update if there's an error
      setProjectInteractions((prev) => ({
        ...prev,
        [projectId]: {
          ...currentInteraction,
          hasLiked: isCurrentlyLiked,
        },
      }))

      // Revert like count
      const revertLikeCount = (projects: Project[]) =>
        projects.map((p) =>
          p.id === projectId
            ? {
                ...p,
                likesCount: isCurrentlyLiked
                  ? Number(p.likesCount)
                  : Math.max(0, Number(p.likesCount) - 1),
              }
            : p,
        )

      setAllProjects(revertLikeCount)
      setFavoriteProjects(revertLikeCount)
      setMyProjects(revertLikeCount)

      // Revert selected project if open
      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject({
          ...selectedProject,
          likesCount: isCurrentlyLiked
            ? Number(selectedProject.likesCount)
            : Math.max(0, Number(selectedProject.likesCount) - 1),
        })
      }
    }
  }

  // Handle favorite project with optimistic updates
  const handleFavoriteProject = async (projectId: string) => {
    if (!session) {
      router.push('/signin')
      return
    }

    // Get current state
    const currentInteraction = projectInteractions[projectId] || {
      hasLiked: false,
      hasFavorited: false,
    }
    const isCurrentlyFavorited = currentInteraction.hasFavorited

    // Apply optimistic update
    setProjectInteractions((prev) => ({
      ...prev,
      [projectId]: {
        ...currentInteraction,
        hasFavorited: !isCurrentlyFavorited,
      },
    }))

    // Update favorites list optimistically
    if (!isCurrentlyFavorited) {
      // Add to favorites
      const project =
        allProjects.find((p) => p.id === projectId) || myProjects.find((p) => p.id === projectId)

      if (project && !favoriteProjects.some((p) => p.id === projectId)) {
        setFavoriteProjects((prev) => [...prev, project])
      }
    } else {
      // Remove from favorites
      setFavoriteProjects((prev) => prev.filter((p) => p.id !== projectId))
    }

    try {
      // Make the actual API call
      const result = await favoriteProject(projectId)

      if (!result.success) {
        // Revert optimistic update if the API call fails
        setProjectInteractions((prev) => ({
          ...prev,
          [projectId]: {
            ...currentInteraction,
            hasFavorited: isCurrentlyFavorited,
          },
        }))

        // Revert favorites list
        if (isCurrentlyFavorited) {
          // Re-add to favorites
          const project =
            allProjects.find((p) => p.id === projectId) ||
            myProjects.find((p) => p.id === projectId)

          if (project) {
            setFavoriteProjects((prev) => [...prev, project])
          }
        } else {
          // Remove from favorites
          setFavoriteProjects((prev) => prev.filter((p) => p.id !== projectId))
        }
      }
    } catch (error) {
      console.error('Failed to favorite project:', error)

      // Revert optimistic update if there's an error
      setProjectInteractions((prev) => ({
        ...prev,
        [projectId]: {
          ...currentInteraction,
          hasFavorited: isCurrentlyFavorited,
        },
      }))

      // Revert favorites list
      if (isCurrentlyFavorited) {
        // Re-add to favorites
        const project =
          allProjects.find((p) => p.id === projectId) || myProjects.find((p) => p.id === projectId)

        if (project) {
          setFavoriteProjects((prev) => [...prev, project])
        }
      } else {
        // Remove from favorites
        setFavoriteProjects((prev) => prev.filter((p) => p.id !== projectId))
      }
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
