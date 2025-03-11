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
    window.location.href = '/signin'
  },
  // Optional: Configure error handling
  onError: (error: Error) => {
    console.error('Authentication error:', error)
  },
  // Add a timeout for session loading
  sessionLoadingTimeout: 5000, // 5 seconds timeout
})

/**
 * Helper function to manually trigger email verification
 * @param email - The email address to send verification to
 * @param callbackURL - The URL to redirect to after verification
 */
export async function resendVerificationEmail(email: string, callbackURL = '/verify-success') {
  try {
    await sendVerificationEmail({
      email,
      callbackURL,
    })
    return { success: true }
  } catch (error: any) {
    console.error('Failed to send verification email:', error)

    // Return more detailed error information
    return {
      success: false,
      error: {
        status: error.status || 500,
        message: error.message || '发送验证邮件失败，请稍后再试',
      },
    }
  }
}
