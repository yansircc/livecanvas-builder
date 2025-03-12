'use client'

import { type Project } from '@/types'
import { ProjectCard } from './project-card'

interface ProjectListProps {
  projects: Project[]
  viewMode: 'grid' | 'list'
  interactions: Record<string, { hasLiked: boolean; hasFavorited: boolean }>
  onSelect: (project: Project) => void
  onLike: (projectId: string) => void
  onFavorite: (projectId: string) => void
}

export function ProjectList({
  projects,
  viewMode,
  interactions,
  onSelect,
  onLike,
  onFavorite,
}: ProjectListProps) {
  return (
    <div
      className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}
    >
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onSelect={onSelect}
          hasLiked={interactions[project.id]?.hasLiked}
          hasFavorited={interactions[project.id]?.hasFavorited}
          onLike={onLike}
          onFavorite={onFavorite}
        />
      ))}
    </div>
  )
}
