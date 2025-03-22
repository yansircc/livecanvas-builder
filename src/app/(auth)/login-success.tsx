'use client'

import { useAuthRedirect } from '@/lib/redirect-utils'

/**
 * 登录成功页面组件
 * 在用户成功登录后显示，然后自动重定向到目标页面
 */
export default function LoginSuccess() {
  // 使用我们的重定向钩子处理重定向逻辑
  useAuthRedirect()

  // 可以添加一些加载状态或欢迎消息
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="mb-4 text-2xl font-bold">登录成功！</h1>
      <p className="text-muted-foreground">正在跳转到您的目标页面...</p>
    </div>
  )
}
