'use client'

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import type { Project } from '../types'
import { EmptyState } from './empty-state'
import { LoadingSpinner } from './loading-spinner'
import { ProjectList } from './project-list'

interface TabContentMyProjectsProps {
  session: { user?: { id: string; name: string; email: string } } | null
  isLoading: boolean
  filteredProjects: Project[]
  viewMode: 'grid' | 'list'
  projectInteractions: Record<string, { hasLiked: boolean; hasFavorited: boolean }>
  onProjectSelect: (project: Project) => void
  onLike: (projectId: string) => void
  onFavorite: (projectId: string) => void
  router: AppRouterInstance
}

export function TabContentMyProjects({
  session,
  isLoading,
  filteredProjects,
  viewMode,
  projectInteractions,
  onProjectSelect,
  onLike,
  onFavorite,
  router,
}: TabContentMyProjectsProps) {
  if (!session) {
    return (
      <EmptyState
        message="请登录查看您的项目"
        actionLabel="登录"
        onAction={() => router.push('/signin')}
      />
    )
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (filteredProjects.length === 0) {
    return (
      <EmptyState
        message="您还没有创建任何项目"
        actionLabel="创建项目"
        onAction={() => router.push('/')}
      />
    )
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
