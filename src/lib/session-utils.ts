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

    return true
  } catch (error) {
    console.error('Error refreshing session:', error)
    return false
  }
}

/**
 * 在用户更新个人资料后获取新的JWT令牌
 * 通过触发刷新令牌来确保JWT包含最新的用户信息
 */
export async function updateJwtToken(): Promise<boolean> {
  try {
    // 使用regenerate-token路由来刷新令牌
    const response = await fetch('/api/auth/regenerate-token', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.warn(`JWT令牌刷新请求失败: ${response.statusText}`)
      return false
    }

    const data = await response.json()

    if (!data.success) {
      console.warn('JWT令牌刷新失败，但将继续后续流程')
      return false
    }

    return true
  } catch (error) {
    console.error('更新JWT令牌时发生错误:', error)
    // 即使发生错误，也不阻止后续流程
    return false
  }
}
