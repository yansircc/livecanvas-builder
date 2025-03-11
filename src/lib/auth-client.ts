import { createAuthClient } from 'better-auth/react'
import { env } from '@/env'

/**
 * Client-side authentication hooks and utilities
 * @see https://www.better-auth.com/docs/integrations/next
 */
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  sendVerificationEmail,
  // Remove updateSession as it's not available in the current version
} = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  // Optional: Configure client-side behavior
  onSessionExpired: () => {
    // Redirect to login page when session expires
    window.location.href = '/login'
  },
  // Optional: Configure error handling
  onError: (error: Error) => {
    console.error('Authentication error:', error)
  },
})

/**
 * Helper function to manually trigger email verification
 * @param email - The email address to send verification to
 * @param callbackURL - The URL to redirect to after verification
 */
export async function resendVerificationEmail(email: string, callbackURL = '/') {
  try {
    await sendVerificationEmail({
      email,
      callbackURL,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return { success: false, error }
  }
}
