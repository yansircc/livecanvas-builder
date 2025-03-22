import { AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type Project } from '@/types'
import { useGalleryStore } from '../store/useGalleryStore'
import { GalleryHeader } from './gallery-header'
import { ProjectModal } from './project-modal'
import { TabContentAll } from './tab-content-all'
import { TabContentFavorites } from './tab-content-favorites'
import { TabContentMyProjects } from './tab-content-my-projects'

interface GalleryClientProps {
  initialAllProjects: Project[]
  initialFavoriteProjects: Project[]
  initialMyProjects: Project[]
  userId?: string | null
  isAuthenticated: boolean
}

export default function GalleryClient({
  initialAllProjects,
  initialFavoriteProjects,
  initialMyProjects,
  userId,
  isAuthenticated,
}: GalleryClientProps) {
  const router = useRouter()

  // Use gallery store state and actions
  const {
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    selectedProject,
    setSelectedProject,
    projectInteractions,
    isInteractionsLoading,
    initializeProjects,
    loadInteractions,
    likeProject: handleLikeProject,
    favoriteProject: handleFavoriteProject,
    copyCode: handleCopyCode,
    availableTags,
    filteredProjects,
    filteredFavorites,
    filteredUserProjects,
  } = useGalleryStore()

  // Initialize projects on mount
  useEffect(() => {
    initializeProjects(initialAllProjects, initialFavoriteProjects, initialMyProjects)
  }, [initializeProjects, initialAllProjects, initialFavoriteProjects, initialMyProjects])

  // Load user interactions on mount
  useEffect(() => {
    if (isAuthenticated && userId) {
      void loadInteractions(userId)
    }
  }, [isAuthenticated, loadInteractions, userId])

  if (!userId) {
    toast.error('请先登录')
  }

  // Handle auth redirect for liking/favoriting when not logged in
  const handleAuthRedirect = (
    action: (projectId: string, userId: string, event?: React.MouseEvent) => Promise<void>,
  ) => {
    return async (projectId: string, event?: React.MouseEvent) => {
      if (!isAuthenticated || !userId) {
        router.push('/signin')
        return
      }
      await action(projectId, userId, event)
    }
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
          availableTags={availableTags()}
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
                isLoading={isInteractionsLoading}
                projects={filteredProjects()}
                viewMode={viewMode}
                interactions={projectInteractions}
                onSelect={setSelectedProject}
                onLike={handleAuthRedirect(handleLikeProject)}
                onFavorite={handleAuthRedirect(handleFavoriteProject)}
              />
            </TabsContent>
            <TabsContent value="favorites" className="mt-6">
              <TabContentFavorites
                isLoading={isInteractionsLoading}
                projects={filteredFavorites()}
                viewMode={viewMode}
                interactions={projectInteractions}
                onSelect={setSelectedProject}
                onLike={handleAuthRedirect(handleLikeProject)}
                onFavorite={handleAuthRedirect(handleFavoriteProject)}
              />
            </TabsContent>
            <TabsContent value="my-projects" className="mt-6">
              <TabContentMyProjects
                isLoading={isInteractionsLoading}
                projects={filteredUserProjects()}
                viewMode={viewMode}
                interactions={projectInteractions}
                onSelect={setSelectedProject}
                onLike={handleAuthRedirect(handleLikeProject)}
                onFavorite={handleAuthRedirect(handleFavoriteProject)}
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
            onLike={handleAuthRedirect(handleLikeProject)}
            onFavorite={handleAuthRedirect(handleFavoriteProject)}
            onCopyCode={handleCopyCode}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
