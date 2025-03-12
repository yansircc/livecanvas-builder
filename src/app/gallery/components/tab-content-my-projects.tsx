'use client'

import { type Project } from '@/types'
import { EmptyState } from './empty-state'
import { LoadingSpinner } from './loading-spinner'
import { ProjectList } from './project-list'

interface TabContentMyProjectsProps {
  isLoading: boolean
  projects: Project[]
  viewMode: 'grid' | 'list'
  interactions: Record<string, { hasLiked: boolean; hasFavorited: boolean }>
  onSelect: (project: Project) => void
  onLike: (projectId: string) => void
  onFavorite: (projectId: string) => void
}

export function TabContentMyProjects({
  isLoading,
  projects,
  viewMode,
  interactions,
  onSelect,
  onLike,
  onFavorite,
}: TabContentMyProjectsProps) {
  if (isLoading) {
    return <LoadingSpinner />
  }

  if (projects.length === 0) {
    return <EmptyState message="你还没有创建任何项目" />
  }

  return (
    <ProjectList
      projects={projects}
      viewMode={viewMode}
      interactions={interactions}
      onSelect={onSelect}
      onLike={onLike}
      onFavorite={onFavorite}
    />
  )
}
