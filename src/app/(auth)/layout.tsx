/**
 * 认证页面布局
 * 简化版本，移除服务器端验证避免重定向循环
 */
import { Suspense } from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // 移除验证逻辑，因为中间件已经处理重定向
  // 这避免了中间件和布局之间可能的重定向冲突

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
          <div className="animate-pulse text-zinc-500 dark:text-zinc-400">加载中...</div>
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
