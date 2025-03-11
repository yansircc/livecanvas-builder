'use client'

import type { Project } from '../types'
import { EmptyState } from './empty-state'
import { LoadingSpinner } from './loading-spinner'
import { ProjectList } from './project-list'

interface TabContentAllProps {
  isLoading: boolean
  filteredProjects: Project[]
  viewMode: 'grid' | 'list'
  projectInteractions: Record<string, { hasLiked: boolean; hasFavorited: boolean }>
  onProjectSelect: (project: Project) => void
  onLike: (projectId: string) => void
  onFavorite: (projectId: string) => void
}

export function TabContentAll({
  isLoading,
  filteredProjects,
  viewMode,
  projectInteractions,
  onProjectSelect,
  onLike,
  onFavorite,
}: TabContentAllProps) {
  if (isLoading) {
    return <LoadingSpinner />
  }

  if (filteredProjects.length === 0) {
    return <EmptyState message="没有找到项目" />
  }

  return (
    <ProjectList
      projects={filteredProjects}
      viewMode={viewMode}
      projectInteractions={projectInteractions}
      onProjectSelect={onProjectSelect}
      onLike={onLike}
      onFavorite={onFavorite}
    />
  )
}
