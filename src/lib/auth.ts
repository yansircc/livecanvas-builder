import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { env } from '@/env'
import { db } from '@/server/db/'
import { account, session, user, verification } from '@/server/db/schema'

/**
 * Better Auth configuration
 * @see https://www.better-auth.com/docs/basic-usage
 * @see https://www.better-auth.com/docs/authentication/email-password
 * @see https://www.better-auth.com/docs/adapters/drizzle
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
    },
  }),

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    verifyEmail: false, // Set to true in production for email verification

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

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  // Security configuration
  secret: env.BETTER_AUTH_SECRET,
  tablePrefix: 'lc_builder_', // Match our schema prefix

  // Optional: Configure callbacks
  callbacks: {
    // Customize the session object
    session: ({ session, user }: { session: any; user: any }) => {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
    // Control which users can sign in
    signIn: ({ user }: { user: any }) => {
      // Always allow sign in for now
      return true
    },
  },

  plugins: [nextCookies()],
})
