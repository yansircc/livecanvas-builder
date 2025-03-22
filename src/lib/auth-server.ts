import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

/**
 * 获取服务器端会话函数
 *
 * 这个函数有两个主要用途:
 * 1. 身份验证 - 在服务器操作（Server Actions）中用于验证用户，因为这些操作不经过中间件
 * 2. 获取用户数据 - 在已经通过中间件验证的路由中获取用户ID等信息
 *
 * 注意：这个函数在Node.js环境中工作，可能不适用于Edge Runtime
 */
export async function getServerSession() {
  try {
    // 捕获可能的错误
    try {
      // 通过Better Auth API获取会话
      const session = await auth.api.getSession({
        headers: await headers(),
      })
      return session
    } catch (apiError) {
      console.error('Better Auth API错误，使用替代方法:', apiError)

      // 如果Better Auth API失败，尝试基本检查
      const headersList = await headers()

      // 检查cookie是否存在
      const cookie = headersList.get('cookie')
      if (
        !cookie ||
        (!cookie.includes('lc_builder_session=') && !cookie.includes('next-auth.session-token='))
      ) {
        return null
      }

      // 返回基本会话信息
      return {
        user: {
          id: 'unknown-id',
          name: 'Unknown User',
          email: 'unknown@example.com',
          image: null,
        },
      }
    }
  } catch (error) {
    console.error('获取服务器会话失败:', error)
    return null
  }
}

/**
 * 检查用户是否已登录
 * 快速检查，不返回完整会话数据
 *
 * 在需要简单验证但不需要用户数据的场景使用
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getServerSession()
    return session !== null
  } catch (error) {
    console.error('验证身份失败:', error)
    return false
  }
}
