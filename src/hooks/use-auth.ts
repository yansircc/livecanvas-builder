import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { decodeJwtToken, getJwtToken, isAuthenticated } from '@/lib/jwt-client'

export interface AuthUser {
  id: string
  name: string
  email: string
  image?: string | null
  backgroundInfo?: string | null
}

interface UseAuthOptions {
  required?: boolean
  redirectTo?: string
  fetchAdditionalData?: boolean
}

export function useAuth(options: UseAuthOptions = {}) {
  const { required = false, redirectTo = '/signin', fetchAdditionalData = true } = options

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthed, setIsAuthed] = useState(false)
  const [userData, setUserData] = useState<AuthUser | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadUserData() {
      try {
        // Check if user is authenticated
        const authenticated = await isAuthenticated()
        setIsAuthed(authenticated)

        if (authenticated) {
          // Get JWT token
          const token = await getJwtToken()

          if (token) {
            // Decode JWT payload using our utility function
            const payload = decodeJwtToken(token)

            if (payload) {
              if (fetchAdditionalData) {
                // Fetch additional user data if needed
                try {
                  const response = await fetch('/api/user/me')

                  if (response.ok) {
                    const data = await response.json()
                    if (data.success && data.user) {
                      setUserData({
                        id: payload.id,
                        name: data.user.name || payload.name || '',
                        email: payload.email || '',
                        image: data.user.image || payload.image || null,
                        backgroundInfo: data.user.backgroundInfo || null,
                      })
                    } else {
                      // Fallback to JWT data if API call fails
                      setUserData({
                        id: payload.id,
                        name: payload.name || '',
                        email: payload.email || '',
                        image: payload.image || null,
                      })
                    }
                  } else {
                    // Fallback to JWT data if API call fails
                    setUserData({
                      id: payload.id,
                      name: payload.name || '',
                      email: payload.email || '',
                      image: payload.image || null,
                    })
                  }
                } catch (error) {
                  // Fallback to JWT data if API call fails
                  setUserData({
                    id: payload.id,
                    name: payload.name || '',
                    email: payload.email || '',
                    image: payload.image || null,
                  })
                  console.error('Error fetching additional user data:', error)
                }
              } else {
                // Just use JWT data without additional API call
                setUserData({
                  id: payload.id,
                  name: payload.name || '',
                  email: payload.email || '',
                  image: payload.image || null,
                })
              }
            }
          }
        } else if (required) {
          // If authentication is required but user is not authenticated, redirect
          router.push(redirectTo)
        }
      } catch (error) {
        console.error('Error in authentication:', error)
        setError(error instanceof Error ? error : new Error(String(error)))
        if (required) {
          router.push(redirectTo)
        }
      } finally {
        setIsLoading(false)
      }
    }

    void loadUserData() // Use void operator to explicitly mark promise as ignored
  }, [router, required, redirectTo, fetchAdditionalData])

  return {
    user: userData,
    isLoading,
    isAuthenticated: isAuthed,
    error,
  }
}
