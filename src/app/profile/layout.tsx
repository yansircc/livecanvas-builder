import type { ReactNode } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LiveCanvas - 用户资料',
  description: '管理你的LiveCanvas用户资料与设置',
}

/**
 * 用户资料页面布局
 * 注意：身份验证由中间件自动处理，不需要在此检查
 */
export default function ProfileLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return <>{children}</>
}
