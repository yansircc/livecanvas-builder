/**
 * Utility functions for managing user sessions
 */

/**
 * Refreshes the user session by forcing a reload
 * This is a workaround for the limitation in better-auth that doesn't provide
 * a direct way to update the session client-side
 */
export async function refreshSession(): Promise<void> {
  // Force a hard reload to refresh the session
  window.location.reload()
}

/**
 * Updates the user session with the latest data from the database
 * @returns A promise that resolves to true if the session was updated successfully
 */
export async function updateSessionData(): Promise<boolean> {
  try {
    // First, call our custom update-session API to ensure the session data is updated
    const updateResponse = await fetch('/api/auth/update-session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!updateResponse.ok) {
      console.error('Failed to update session data:', updateResponse.statusText)
    }

    // Then call the refresh session API
    const response = await fetch('/api/auth/refresh-session', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Failed to refresh session:', response.statusText)
      return false
    }

    // Force a reload to apply the updated session
    setTimeout(() => {
      window.location.reload()
    }, 300)

    return true
  } catch (error) {
    console.error('Error refreshing session:', error)
    return false
  }
}
