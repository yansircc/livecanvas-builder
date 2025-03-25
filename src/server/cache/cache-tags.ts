/**
 * Cache tag constants for the application
 * Use these constants instead of string literals to ensure consistency
 */
export const CACHE_TAGS = {
  // Auth related cache tags
  AUTH: {
    SESSION: "auth:session",
    USER: (userId: string) => `auth:user:${userId}`,
  },

  // Project related cache tags
  PROJECT: {
    // List level cache
    LIST: {
      PUBLIC: "projects:list:public",
      BY_USER: (userId: string) => `projects:list:user:${userId}`,
    },

    // Individual project cache
    DETAIL: (projectId: string) => `project:${projectId}`,

    // Project interactions
    INTERACTION: {
      PURCHASED: (projectId: string, userId: string) =>
        `project:${projectId}:purchased:${userId}`,
      FAVORITED: (projectId: string, userId: string) =>
        `project:${projectId}:favorited:${userId}`,
      // Lists of user's interactions
      LISTS: {
        PURCHASED: (userId: string) => `projects:list:purchased:${userId}`,
        FAVORITED: (userId: string) => `projects:list:favorited:${userId}`,
      },
    },
  },

  // User related cache tags
  USER: {
    PROFILE: (userId: string) => `user:${userId}:profile`,
  },
} as const;
