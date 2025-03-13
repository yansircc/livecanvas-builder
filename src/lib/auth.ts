import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { db } from '@/db'
import { account, session, user, verification } from '@/db/schema'
import { env } from '@/env'
import { sendEmail } from '@/lib/send-email'
import { isCI } from '@/utils/is-ci'

// 在 CI 环境中使用安全的默认值
const safeSecret = isCI ? 'ci-test-secret-key-for-testing-only' : env.BETTER_AUTH_SECRET

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
      // 在 CI 环境中跳过发送邮件
      if (isCI) {
        console.log('CI 环境中跳过发送验证邮件')
        return
      }

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
  },

  // Security configuration
  secret: safeSecret,
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
