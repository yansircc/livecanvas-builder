import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/lib/auth'

/**
 * Better Auth API路由处理程序
 * 处理所有身份验证请求，包括JWT端点
 *
 * 文档: https://www.better-auth.com/docs/guides/next-auth-migration-guide
 */
export const { GET, POST } = toNextJsHandler(auth)
