import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { decodeJwtToken, getJwtToken, isAuthenticated } from '@/lib/jwt-client'

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
              // 直接使用JWT负载中的用户数据，所有需要的信息都应该在令牌中
              setUserData({
                id: payload.id,
                name: payload.name || '',
                email: payload.email || '',
                image: payload.image || null,
              })
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
  }, [router, required, redirectTo])

  return {
    user: userData,
    isLoading,
    isAuthenticated: isAuthed,
    error,
  }
}
