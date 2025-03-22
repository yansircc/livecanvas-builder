'use server'

import { initializeImageCache } from '@/lib/unsplash'

// Track initialization state
let isInitialized = false

// Non-cached function for initialization
export async function CacheInitializer() {
  // Call the cached component after initializing
  await initializeSystems()
  return null
}

// Cached version that doesn't use any dynamic data sources
async function initializeSystems() {
  'use cache'

  // Only run initialization once
  if (!isInitialized) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Initializing app systems...')
    }

    try {
      // Initialize image system
      initializeImageCache()

      if (process.env.NODE_ENV === 'development') {
        console.log('App initialization completed')
      }
    } catch (error) {
      console.error('Error during app initialization:', error)
    }

    isInitialized = true
  }

  // This is a server component, no UI needed
  return null
}
