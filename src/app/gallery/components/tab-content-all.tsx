'use client'

import { type Project } from '@/types'
import { EmptyState } from './empty-state'
import { ProjectList } from './project-list'

interface TabContentAllProps {
  isLoading: boolean
  projects: Project[]
  viewMode: 'grid' | 'list'
  interactions: Record<string, { hasLiked: boolean; hasFavorited: boolean }>
  onSelect: (project: Project) => void
  onLike: (projectId: string, event?: React.MouseEvent) => void
  onFavorite: (projectId: string, event?: React.MouseEvent) => void
}

export function TabContentAll({
  isLoading,
  projects,
  viewMode,
  interactions,
  onSelect,
  onLike,
  onFavorite,
}: TabContentAllProps) {
  // Project data is already loaded, we're just waiting for interactions
  if (projects.length === 0) {
    return <EmptyState message="没有找到项目" />
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute top-0 right-4 z-10">
          <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"></div>
        </div>
      )}
      <ProjectList
        projects={projects}
        viewMode={viewMode}
        interactions={interactions}
        onSelect={onSelect}
        onLike={onLike}
        onFavorite={onFavorite}
      />
    </div>
  )
}
