'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * 登录成功后处理重定向
 * 这个钩子可以在登录成功组件中使用，确保用户正确跳转到目标页面
 */
export function useAuthRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // 获取回调URL
    const callbackUrl = searchParams?.get('callbackUrl')
    console.log('[Auth] Redirect detected, callback URL:', callbackUrl)

    // 如果有回调URL，重定向到那里
    if (callbackUrl) {
      console.log('[Auth] Redirecting to callback URL:', callbackUrl)
      router.push(callbackUrl)
    } else {
      // 否则重定向到仪表板
      console.log('[Auth] No callback URL, redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [router, searchParams])
}

/**
 * 解析URL中的回调参数
 * @param url 完整URL或路径
 * @returns 回调URL或null
 */
export function parseCallbackUrl(url: string): string | null {
  try {
    // 尝试解析URL或路径
    const parsedUrl = new URL(url, window.location.origin)
    return parsedUrl.searchParams.get('callbackUrl')
  } catch (error) {
    console.error('[Auth] Error parsing URL:', error)
    return null
  }
}
