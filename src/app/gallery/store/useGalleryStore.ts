import { create } from 'zustand'
import { favoriteProject, getUserInteractions, likeProject } from '@/actions/gallery'
import { type Project } from '@/types'

interface ProjectInteraction {
  hasLiked: boolean
  hasFavorited: boolean
}

interface GalleryState {
  // UI state
  viewMode: 'grid' | 'list'
  searchQuery: string
  selectedTags: string[]
  selectedProject: Project | null

  // Data state
  allProjects: Project[]
  favoriteProjects: Project[]
  myProjects: Project[]
  projectInteractions: Record<string, ProjectInteraction>

  // Loading state
  isInteractionsLoading: boolean
  interactionsLoaded: boolean

  // Computed values
  availableTags: () => string[]
  filteredProjects: () => Project[]
  filteredFavorites: () => Project[]
  filteredUserProjects: () => Project[]

  // Actions
  setViewMode: (mode: 'grid' | 'list') => void
  setSearchQuery: (query: string) => void
  setSelectedTags: (tags: string[]) => void
  setSelectedProject: (project: Project | null) => void

  // Data initialization
  initializeProjects: (
    allProjects: Project[],
    favoriteProjects: Project[],
    myProjects: Project[],
  ) => void

  // Interactions
  loadInteractions: (userId: string) => Promise<void>
  likeProject: (projectId: string, userId: string, event?: React.MouseEvent) => Promise<void>
  favoriteProject: (projectId: string, userId: string) => Promise<void>
  copyCode: () => void
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
  // UI state
  viewMode: 'grid',
  searchQuery: '',
  selectedTags: [],
  selectedProject: null,

  // Data state
  allProjects: [],
  favoriteProjects: [],
  myProjects: [],
  projectInteractions: {},

  // Loading state
  isInteractionsLoading: false,
  interactionsLoaded: false,

  // Computed values
  availableTags: () => {
    const { allProjects, favoriteProjects, myProjects } = get()
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
  },

  filteredProjects: () => {
    return filterProjects(get().allProjects, get().searchQuery, get().selectedTags)
  },

  filteredFavorites: () => {
    return filterProjects(get().favoriteProjects, get().searchQuery, get().selectedTags)
  },

  filteredUserProjects: () => {
    return filterProjects(get().myProjects, get().searchQuery, get().selectedTags)
  },

  // Actions
  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTags: (tags) => set({ selectedTags: tags }),
  setSelectedProject: (project) => set({ selectedProject: project }),

  // Data initialization
  initializeProjects: (allProjects, favoriteProjects, myProjects) => {
    set({
      allProjects,
      favoriteProjects,
      myProjects,
      projectInteractions: initializeInteractions(favoriteProjects, allProjects, myProjects),
    })
  },

  // Interactions
  loadInteractions: async (userId: string) => {
    const state = get()

    // Skip if interactions already loaded or no userId provided
    if (state.interactionsLoaded || !userId) {
      return
    }

    // Store cache timestamp in sessionStorage to avoid unnecessary refetches
    const cachedTimestamp =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('gallery-interactions-timestamp')
        : null

    if (cachedTimestamp) {
      const timestamp = parseInt(cachedTimestamp, 10)
      // Only refetch if cache is older than 5 minutes
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        try {
          const cachedInteractions = sessionStorage.getItem('gallery-interactions')
          if (cachedInteractions) {
            set((state) => ({
              projectInteractions: {
                ...state.projectInteractions,
                ...JSON.parse(cachedInteractions),
              },
              interactionsLoaded: true,
            }))
            return
          }
        } catch (error) {
          console.error('Error parsing cached interactions:', error)
        }
      }
    }

    set({ isInteractionsLoading: true })

    try {
      const interactions: Record<string, ProjectInteraction> = {}

      await Promise.all(
        state.allProjects.map(async (project) => {
          const result = await getUserInteractions(project.id, userId)
          if (result.success) {
            interactions[project.id] = result.data || { hasLiked: false, hasFavorited: false }
          }
        }),
      )

      // Merge with existing interactions to avoid UI jumps
      set((state) => {
        const newInteractions = { ...state.projectInteractions, ...interactions }

        // Cache interactions for future visits
        try {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('gallery-interactions', JSON.stringify(interactions))
            sessionStorage.setItem('gallery-interactions-timestamp', Date.now().toString())
          }
        } catch (error) {
          console.error('Error caching interactions:', error)
        }

        return {
          projectInteractions: newInteractions,
          interactionsLoaded: true,
          isInteractionsLoading: false,
        }
      })
    } catch (error) {
      console.error('Failed to load interactions:', error)
      set({ isInteractionsLoading: false })
    }
  },

  likeProject: async (projectId: string, userId: string, event?: React.MouseEvent) => {
    // Prevent event propagation if called from within modal
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    if (!userId) {
      return
    }

    // Get current state
    const state = get()
    const currentInteraction = state.projectInteractions[projectId] || {
      hasLiked: false,
      hasFavorited: false,
    }
    const isCurrentlyLiked = currentInteraction.hasLiked

    // Apply optimistic update
    set((state) => ({
      projectInteractions: {
        ...state.projectInteractions,
        [projectId]: {
          ...currentInteraction,
          hasLiked: !isCurrentlyLiked,
        },
      },
      allProjects: updateLikeCount(state.allProjects, projectId, isCurrentlyLiked),
      favoriteProjects: updateLikeCount(state.favoriteProjects, projectId, isCurrentlyLiked),
      myProjects: updateLikeCount(state.myProjects, projectId, isCurrentlyLiked),
      selectedProject:
        state.selectedProject?.id === projectId
          ? {
              ...state.selectedProject,
              likesCount: !isCurrentlyLiked
                ? Number(state.selectedProject.likesCount) + 1
                : Math.max(0, Number(state.selectedProject.likesCount) - 1),
            }
          : state.selectedProject,
    }))

    try {
      // Make the actual API call
      const result = await likeProject(projectId, userId)

      if (!result.success) {
        // Revert optimistic update if the API call fails
        revertLikeOptimisticUpdate(get, set, projectId, currentInteraction, isCurrentlyLiked)
      }
    } catch (error) {
      console.error('Failed to like project:', error)
      // Revert optimistic update if there's an error
      revertLikeOptimisticUpdate(get, set, projectId, currentInteraction, isCurrentlyLiked)
    }
  },

  favoriteProject: async (projectId: string, userId: string) => {
    if (!userId) {
      return
    }

    // Get current state
    const state = get()
    const currentInteraction = state.projectInteractions[projectId] || {
      hasLiked: false,
      hasFavorited: false,
    }
    const isCurrentlyFavorited = currentInteraction.hasFavorited

    // Apply optimistic update
    set((state) => {
      const newState = {
        projectInteractions: {
          ...state.projectInteractions,
          [projectId]: {
            ...currentInteraction,
            hasFavorited: !isCurrentlyFavorited,
          },
        },
      }

      // Update favorites list optimistically
      if (!isCurrentlyFavorited) {
        // Add to favorites
        const project =
          state.allProjects.find((p) => p.id === projectId) ||
          state.myProjects.find((p) => p.id === projectId)

        if (project && !state.favoriteProjects.some((p) => p.id === projectId)) {
          return {
            ...newState,
            favoriteProjects: [...state.favoriteProjects, project],
          }
        }
        return newState
      } else {
        // Remove from favorites
        return {
          ...newState,
          favoriteProjects: state.favoriteProjects.filter((p) => p.id !== projectId),
        }
      }
    })

    try {
      // Make the actual API call
      const result = await favoriteProject(projectId, userId)

      if (!result.success) {
        // Revert optimistic update if the API call fails
        revertFavoriteOptimisticUpdate(
          get,
          set,
          projectId,
          currentInteraction,
          isCurrentlyFavorited,
        )
      }
    } catch (error) {
      console.error('Failed to favorite project:', error)
      // Revert optimistic update if there's an error
      revertFavoriteOptimisticUpdate(get, set, projectId, currentInteraction, isCurrentlyFavorited)
    }
  },

  copyCode: () => {
    // Just log the action, visual feedback is handled in the component
    console.log('Code copied to clipboard')
  },
}))

// Helper functions
function filterProjects(
  projects: Project[],
  searchQuery: string,
  selectedTags: string[],
): Project[] {
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
}

function updateLikeCount(
  projects: Project[],
  projectId: string,
  isCurrentlyLiked: boolean,
): Project[] {
  return projects.map((p) =>
    p.id === projectId
      ? {
          ...p,
          likesCount: !isCurrentlyLiked
            ? Number(p.likesCount) + 1
            : Math.max(0, Number(p.likesCount) - 1),
        }
      : p,
  )
}

function revertLikeOptimisticUpdate(
  get: () => GalleryState,
  set: (partial: Partial<GalleryState> | ((state: GalleryState) => Partial<GalleryState>)) => void,
  projectId: string,
  currentInteraction: ProjectInteraction,
  isCurrentlyLiked: boolean,
) {
  const state = get()

  set({
    projectInteractions: {
      ...state.projectInteractions,
      [projectId]: {
        ...currentInteraction,
        hasLiked: isCurrentlyLiked,
      },
    },
    allProjects: updateLikeCount(state.allProjects, projectId, !isCurrentlyLiked),
    favoriteProjects: updateLikeCount(state.favoriteProjects, projectId, !isCurrentlyLiked),
    myProjects: updateLikeCount(state.myProjects, projectId, !isCurrentlyLiked),
    selectedProject:
      state.selectedProject?.id === projectId
        ? {
            ...state.selectedProject,
            likesCount: isCurrentlyLiked
              ? Number(state.selectedProject.likesCount)
              : Math.max(0, Number(state.selectedProject.likesCount) - 1),
          }
        : state.selectedProject,
  })
}

function revertFavoriteOptimisticUpdate(
  get: () => GalleryState,
  set: (partial: Partial<GalleryState> | ((state: GalleryState) => Partial<GalleryState>)) => void,
  projectId: string,
  currentInteraction: ProjectInteraction,
  isCurrentlyFavorited: boolean,
) {
  const state = get()

  set((state) => {
    const newState = {
      projectInteractions: {
        ...state.projectInteractions,
        [projectId]: {
          ...currentInteraction,
          hasFavorited: isCurrentlyFavorited,
        },
      },
    }

    if (isCurrentlyFavorited) {
      // Re-add to favorites
      const project =
        state.allProjects.find((p) => p.id === projectId) ||
        state.myProjects.find((p) => p.id === projectId)

      if (project) {
        return {
          ...newState,
          favoriteProjects: [...state.favoriteProjects, project],
        }
      }
      return newState
    } else {
      // Remove from favorites
      return {
        ...newState,
        favoriteProjects: state.favoriteProjects.filter((p) => p.id !== projectId),
      }
    }
  })
}

function initializeInteractions(
  favoriteProjects: Project[],
  allProjects: Project[],
  myProjects: Project[],
): Record<string, ProjectInteraction> {
  const defaults: Record<string, ProjectInteraction> = {}

  // For favorites, we know the user has favorited them
  favoriteProjects.forEach((project) => {
    defaults[project.id] = { hasLiked: false, hasFavorited: true }
  })

  // For other projects, assume not liked/favorited
  allProjects.forEach((project) => {
    if (!defaults[project.id]) {
      defaults[project.id] = { hasLiked: false, hasFavorited: false }
    }
  })

  myProjects.forEach((project) => {
    if (!defaults[project.id]) {
      defaults[project.id] = { hasLiked: false, hasFavorited: false }
    }
  })

  return defaults
}
