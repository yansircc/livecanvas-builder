'use client'

import type { Project } from '../types'
import { ProjectCard } from './project-card'

interface ProjectListProps {
  projects: Project[]
  viewMode: 'grid' | 'list'
  projectInteractions: Record<string, { hasLiked: boolean; hasFavorited: boolean }>
  onProjectSelect: (project: Project) => void
  onLike: (projectId: string) => void
  onFavorite: (projectId: string) => void
  alwaysFavorited?: boolean
}

export function ProjectList({
  projects,
  viewMode,
  projectInteractions,
  onProjectSelect,
  onLike,
  onFavorite,
  alwaysFavorited = false,
}: ProjectListProps) {
  return (
    <div
      className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
    >
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onProjectSelect={onProjectSelect}
          hasLiked={projectInteractions[project.id]?.hasLiked}
          hasFavorited={alwaysFavorited ? true : projectInteractions[project.id]?.hasFavorited}
          onLike={onLike}
          onFavorite={onFavorite}
        />
      ))}
    </div>
  )
}
