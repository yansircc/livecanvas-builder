'use client'

import { useCallback, useMemo, useState } from 'react'
import { favoriteProject, likeProject } from '@/actions/gallery'
import { type Project } from '@/types'
import { GalleryHeader } from './gallery-header'
import { GalleryProjectCard } from './gallery-project-card'
import { ProjectModal } from './project-modal'

interface ClientGalleryTabsProps {
  initialProjects: Project[]
  initialInteractions: Record<string, { hasLiked: boolean; hasFavorited: boolean }>
  userId?: string
  isAuthenticated: boolean
}

export function ClientGalleryTabs({
  initialProjects,
  initialInteractions,
  userId,
  isAuthenticated,
}: ClientGalleryTabsProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [interactions, setInteractions] = useState(initialInteractions)

  // Extract all available tags from projects (memoized)
  const availableTags = useMemo(
    () =>
      initialProjects
        .flatMap((project) =>
          project.tags ? project.tags.split(',').map((tag) => tag.trim()) : [],
        )
        .filter((tag, index, self) => tag && self.indexOf(tag) === index)
        .sort(),
    [initialProjects],
  )

  // Filter projects based on tags (memoized)
  const filteredProjects = useMemo(
    () =>
      initialProjects.filter((project) => {
        // Skip filtering if no filters are applied
        if (selectedTags.length === 0) return true

        // Filter by tags - project must contain ALL selected tags (intersection)
        if (selectedTags.length > 0) {
          if (!project.tags) return false
          const projectTags = project.tags.split(',').map((tag) => tag.trim())
          return selectedTags.every((tag) => projectTags.includes(tag))
        }

        return true
      }),
    [initialProjects, selectedTags],
  )

  // Handle interactions with memoized callbacks
  const handleInteraction = useCallback(
    async (projectId: string, action: 'like' | 'favorite', event?: React.MouseEvent) => {
      if (event) {
        event.preventDefault()
        event.stopPropagation()
      }

      if (!isAuthenticated || !userId) return

      // Optimistic update
      setInteractions((prev) => {
        const current = prev[projectId] || { hasLiked: false, hasFavorited: false }
        return {
          ...prev,
          [projectId]: {
            ...current,
            [action === 'like' ? 'hasLiked' : 'hasFavorited']:
              !current[action === 'like' ? 'hasLiked' : 'hasFavorited'],
          },
        }
      })

      // Call the server action
      if (action === 'like') {
        await likeProject(projectId, userId)
      } else {
        await favoriteProject(projectId, userId)
      }
    },
    [isAuthenticated, userId],
  )

  const handleLike = useCallback(
    (projectId: string, event?: React.MouseEvent) => handleInteraction(projectId, 'like', event),
    [handleInteraction],
  )

  const handleFavorite = useCallback(
    (projectId: string, event?: React.MouseEvent) =>
      handleInteraction(projectId, 'favorite', event),
    [handleInteraction],
  )

  return (
    <>
      <GalleryHeader
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        availableTags={availableTags}
      />

      <div className="mt-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredProjects.map((project) => (
            <GalleryProjectCard
              key={project.id}
              project={project}
              onSelect={setSelectedProject}
              hasLiked={interactions[project.id]?.hasLiked || false}
              hasFavorited={interactions[project.id]?.hasFavorited || false}
              onLike={handleLike}
              onFavorite={handleFavorite}
            />
          ))}

          {filteredProjects.length === 0 && (
            <div className="col-span-full flex h-32 items-center justify-center text-zinc-500">
              No projects found
            </div>
          )}
        </div>
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          hasLiked={interactions[selectedProject.id]?.hasLiked || false}
          hasFavorited={interactions[selectedProject.id]?.hasFavorited || false}
          onLike={handleLike}
          onFavorite={handleFavorite}
          onCopyCode={(htmlContent) => {
            void navigator.clipboard.writeText(htmlContent)
          }}
        />
      )}
    </>
  )
}
