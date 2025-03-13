'use server'

import { initializeImageCache } from '@/lib/unsplash'

// Track initialization state
let isInitialized = false

export async function CacheInitializer() {
  // Ensure initialization happens only once
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
