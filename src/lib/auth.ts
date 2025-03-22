import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { bearer, jwt } from 'better-auth/plugins'
import { db } from '@/db'
import { account, jwks, session, user, verification } from '@/db/schema'
import { env } from '@/env'
import { sendEmail } from '@/lib/send-email'

/**
 * Better Auth configuration
 * @see https://www.better-auth.com/docs/basic-usage
 * @see https://www.better-auth.com/docs/authentication/email-password
 * @see https://www.better-auth.com/docs/adapters/drizzle
 * @see https://www.better-auth.com/docs/plugins/jwt
 */
export const auth = betterAuth({
  // Configure the database adapter
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      account,
      verification,
      jwks, // Include jwks schema for JWT support
    },
  }),

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    verifyEmail: true, // Enable email verification
    requireEmailVerification: true, // Require email verification before login

    // Custom validation for password
    passwordValidation: {
      minLength: 8,
      maxLength: 100,
      requireLowercase: true,
      requireUppercase: true,
      requireNumber: true,
      requireSpecialChar: false,
    },

    // 简化用户创建前的处理逻辑
    onBeforeCreateUser: (userData: Record<string, any>) => {
      // 只设置 emailVerified 为 null，不做其他处理
      return {
        ...userData,
        emailVerified: null,
      }
    },
  },

  // Email verification configuration
  emailVerification: {
    sendOnSignUp: true, // Send verification email on signup
    verificationCallbackURL: '/verify-success', // Redirect to this URL after verification
    autoSignInAfterVerification: false, // 不要在验证后自动登录
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        // 确保 URL 包含正确的回调地址
        // 如果 URL 已经包含 callbackURL 参数，则替换它
        const urlObj = new URL(url)
        const hasCallbackParam = urlObj.searchParams.has('callbackURL')

        if (hasCallbackParam) {
          urlObj.searchParams.set('callbackURL', '/verify-success')
        } else {
          // 如果没有 callbackURL 参数，则添加它
          urlObj.searchParams.append('callbackURL', '/verify-success')
        }

        const finalUrl = urlObj.toString()

        // Use the sendEmail function to send verification email
        await sendEmail({
          to: user.email,
          subject: 'Verify your email address',
          body: `
            <h1>Verify your email address</h1>
            <p>Thank you for signing up! Please click the link below to verify your email address:</p>
            <p><a href="${finalUrl}" style="padding: 10px 15px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
            <p>Or copy and paste this URL into your browser:</p>
            <p>${finalUrl}</p>
            <p>This link will expire in 24 hours.</p>
          `,
        })
      } catch (error) {
        console.error('发送验证邮件失败:', error)
      }
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    strategy: 'jwt', // Use JWT for session strategy
  },

  // Security configuration
  secret: env.BETTER_AUTH_SECRET,
  tablePrefix: 'lc_builder_',

  // Optional: Configure callbacks
  callbacks: {
    // Control which users can sign in
    signIn: ({ user }: { user: any }) => {
      // Always allow sign in for now
      return true
    },
  },

  plugins: [
    nextCookies(),
    jwt({
      // JWT configuration
      jwt: {
        // Set a custom expiration time (default is 15 minutes)
        expirationTime: '1d',

        // Define a custom payload for the JWT token
        definePayload: (session) => {
          return {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            emailVerified: session.user.emailVerified,
          }
        },

        // Custom issuer and audience (optional)
        // issuer: "https://your-app-domain.com",
        // audience: "https://your-app-domain.com",
      },

      // JWKS configuration
      jwks: {
        keyPairConfig: {
          alg: 'EdDSA',
          crv: 'Ed25519',
        },
      },
    }),
    bearer(),
  ],
})

// Export auth API helpers
export const api = auth.api

// Helper function to get JWT token from API
export async function getJwtToken() {
  const response = await fetch('/api/auth/token')
  if (!response.ok) return null
  const data = await response.json()
  return data.token
}

// Helper function for client-side auth verification
export async function getClientSession() {
  try {
    if (typeof window === 'undefined') {
      // Server-side, we don't have access to cookies
      return null
    }

    // Create a proper Headers object
    const headers = new Headers()
    headers.append('Cookie', document.cookie)

    const session = await api.getSession({
      headers,
    })

    return session
  } catch (error) {
    console.error('Error getting client session:', error)
    return null
  }
}
