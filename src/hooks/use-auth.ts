'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface AuthUser {
  id: string
  name: string
  email: string
  image?: string | null
}

interface UseAuthOptions {
  required?: boolean
  redirectTo?: string
}

export function useAuth(options: UseAuthOptions = {}) {
  const { required = false, redirectTo = '/signin' } = options

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)
  const [userData, setUserData] = useState<AuthUser | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        // Try to get auth data from data attributes set by server component
        const authElement = document.querySelector('[data-auth-user]')
        const isAuthSuccess = authElement?.getAttribute('data-auth-success') === 'true'
        const userDataStr = authElement?.getAttribute('data-auth-user')

        if (isAuthSuccess && userDataStr) {
          const parsedUserData = JSON.parse(userDataStr)
          setUserData(parsedUserData)
          setIsAuthed(true)
        } else {
          // Fallback to API if data attributes aren't available
          const response = await fetch('/api/auth/user')
          const data = await response.json()

          if (data.success) {
            setUserData(data.user)
            setIsAuthed(true)
          } else if (required) {
            // If authentication is required but user is not authenticated, redirect
            router.push(redirectTo)
          }
        }
      } catch (e) {
        console.error('Error fetching auth data:', e)
        setError(e instanceof Error ? e : new Error(String(e)))
        if (required) {
          router.push(redirectTo)
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Call the async function and handle the promise
    fetchAuthData().catch((e) => {
      console.error('Unhandled error in fetchAuthData:', e)
      setError(e instanceof Error ? e : new Error(String(e)))
      setIsLoading(false)
    })
  }, [router, required, redirectTo])

  return {
    user: userData,
    isLoading,
    isAuthenticated: isAuthed,
    error,
  }
}
