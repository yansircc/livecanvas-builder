'use client'

import { type Project } from '@/types'
import { EmptyState } from './empty-state'
import { LoadingSpinner } from './loading-spinner'
import { ProjectList } from './project-list'

interface TabContentFavoritesProps {
  isLoading: boolean
  projects: Project[]
  viewMode: 'grid' | 'list'
  interactions: Record<string, { hasLiked: boolean; hasFavorited: boolean }>
  onSelect: (project: Project) => void
  onLike: (projectId: string) => void
  onFavorite: (projectId: string) => void
}

export function TabContentFavorites({
  isLoading,
  projects,
  viewMode,
  interactions,
  onSelect,
  onLike,
  onFavorite,
}: TabContentFavoritesProps) {
  if (isLoading) {
    return <LoadingSpinner />
  }

  if (projects.length === 0) {
    return <EmptyState message="你还没有收藏任何项目" />
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
