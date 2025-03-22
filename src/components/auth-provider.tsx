// This file is a Server Component
import { Suspense } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import { headers } from 'next/headers'
import { getCurrentUser } from '@/actions/user'

// Define the props for our components
interface AuthProviderProps {
  children: React.ReactNode
}

// Define the auth result type to match what getCurrentUser returns
type AuthResult = Awaited<ReturnType<typeof getCurrentUser>>

// First fetch user data with the uncached function (accessing headers)
async function AuthDataFetcher({ children }: AuthProviderProps) {
  // Explicitly opt out of caching for the headers-accessing code
  noStore()

  let authResult: AuthResult

  try {
    // Force dynamic rendering by accessing headers directly
    // This ensures the component is rendered at request time
    const headersList = headers()

    // Get user data - getCurrentUser is already properly separated
    authResult = await getCurrentUser()
  } catch (error) {
    // Fallback auth result when headers() fails during prerendering
    authResult = { success: false, error: 'Error during prerendering' }
    console.error('Auth fetch error:', error)
  }

  // Pass data down to the cached component
  return <CachedAuthDataProvider authResult={authResult}>{children}</CachedAuthDataProvider>
}

// Cached component that receives data as props
function CachedAuthDataProvider({
  children,
  authResult,
}: AuthProviderProps & {
  authResult: AuthResult
}) {
  // Serialize the user data and auth state to data attributes
  const userJson = authResult.success && authResult.user ? JSON.stringify(authResult.user) : ''

  // Pass auth data as data attributes to be accessed by client components
  return (
    <div data-auth-user={userJson} data-auth-success={authResult.success ? 'true' : 'false'}>
      {children}
    </div>
  )
}

// Export an async function that uses the cached data provider
export async function AuthProvider({ children }: AuthProviderProps) {
  // Wrap in Suspense to handle async operations
  return (
    <Suspense fallback={<div>{children}</div>}>
      <AuthDataFetcher>{children}</AuthDataFetcher>
    </Suspense>
  )
}
