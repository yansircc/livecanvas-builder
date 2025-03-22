import type { ReactNode } from 'react'

/**
 * 仪表盘布局
 * 注意：身份验证由中间件自动处理，不需要在此检查
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return <>{children}</>
}
