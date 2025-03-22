/**
 * Better Auth JWT 客户端工具
 */

/**
 * 从服务器获取JWT令牌
 * @returns JWT令牌或null（如果未认证）
 */
export async function getJwtToken(): Promise<string | null> {
  try {
    // 调用Better Auth JWT令牌端点
    // 文档: https://www.better-auth.com/docs/plugins/jwt
    const response = await fetch('/api/auth/token', {
      credentials: 'include', // 包含Cookie
    })

    if (!response.ok) {
      console.error('获取JWT令牌失败:', response.statusText)
      return null
    }

    const data = await response.json()
    return data.token
  } catch (error) {
    console.error('获取JWT令牌出错:', error)
    return null
  }
}

/**
 * 客户端解码JWT令牌
 * 注意：此方法不验证令牌的有效性，仅解码内容
 * @param token JWT令牌
 * @returns 解码后的JWT载荷或null（如果解码失败）
 */
export interface JwtPayload {
  id: string
  email?: string
  name?: string
  image?: string | null
  exp?: number
  iat?: number
  [key: string]: unknown
}

export function decodeJwtToken(token: string): JwtPayload | null {
  try {
    const [, payloadBase64] = token.split('.')

    if (!payloadBase64) {
      return null
    }

    // 浏览器兼容的base64解码
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      Array.from(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)),
      ).join(''),
    )

    return JSON.parse(jsonPayload) as JwtPayload
  } catch (error) {
    console.error('解码JWT令牌失败:', error)
    return null
  }
}

/**
 * 为fetch请求添加JWT认证头
 * @param url - 请求URL
 * @param options - fetch选项
 * @returns fetch响应
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getJwtToken()

  if (!token) {
    throw new Error('未认证')
  }

  // 使用JWT令牌添加Authorization头
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // 确保包含Cookie
  })
}

/**
 * 检查当前用户是否通过JWT认证
 * @returns 如果认证则为true，否则为false
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getJwtToken()
  return token !== null
}
