/**
 * 认证页面布局
 * 简化版本，移除服务器端验证避免重定向循环
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // 移除验证逻辑，因为中间件已经处理重定向
  // 这避免了中间件和布局之间可能的重定向冲突

  return <>{children}</>
}
