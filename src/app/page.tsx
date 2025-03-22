'use client'

import { ArrowRight, Code, Layers, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 使用客户端检查会话状态，避免服务器/客户端状态不一致
  useEffect(() => {
    const checkSession = async () => {
      try {
        // 检查是否有会话cookie
        const hasCookie =
          document.cookie.includes('lc_builder_session') ||
          document.cookie.includes('next-auth.session-token')

        console.log('[Home] Session check, cookies found:', hasCookie)
        setIsLoggedIn(hasCookie)

        // 如果有会话cookie，重定向到仪表板
        if (hasCookie) {
          console.log('[Home] User logged in, redirecting to dashboard')
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('[Home] Error checking session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // 立即调用并捕获任何错误
    checkSession().catch((error) => {
      console.error('[Home] Unhandled error in checkSession:', error)
      setIsLoading(false)
    })
  }, [router])

  // 显示加载状态
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">正在加载...</div>
  }

  // 如果用户已登录，这只是作为备份渲染
  // 正常情况下会被useEffect中的重定向处理
  if (isLoggedIn) {
    return null
  }

  // 主页内容
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="container mx-auto flex items-center justify-between py-6">
        <div className="flex items-center gap-2">
          <Layers className="text-primary h-8 w-8" />
          <span className="text-xl font-bold">LiveCanvas Builder</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/signin">
            <Button variant="ghost">登录</Button>
          </Link>
          <Link href="/signup">
            <Button>注册</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto flex flex-col items-center justify-center py-20 text-center md:py-32">
        <h1 className="mb-6 text-4xl leading-tight font-bold md:text-6xl">
          利用 AI 构建精美的 Tailwind CSS 网页组件
        </h1>
        <p className="text-muted-foreground mb-10 max-w-2xl text-xl">
          LiveCanvas Builder 是一个强大的工具，利用 Aihubmax 为 LiveCanvas 生成兼容 Tailwind CSS 的
          HTML 代码。通过简单的提示，你可以创建美观、响应式的网页组件。
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              免费开始使用 <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="https://aihubmix.com/token" target="_blank">
            <Button size="lg" variant="outline">
              获取 API 密钥
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-20">
        <h2 className="mb-12 text-center text-3xl font-bold">强大功能</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center rounded-lg border p-6 text-center">
            <div className="bg-primary/10 mb-4 rounded-full p-3">
              <Code className="text-primary h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">AI 驱动的 HTML 生成</h3>
            <p className="text-muted-foreground">
              使用 Aihubmax 创建兼容 Tailwind CSS 的 HTML，轻松构建响应式组件。
            </p>
          </div>
          <div className="flex flex-col items-center rounded-lg border p-6 text-center">
            <div className="bg-primary/10 mb-4 rounded-full p-3">
              <Layers className="text-primary h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">版本管理</h3>
            <p className="text-muted-foreground">
              跟踪并切换不同的生成代码版本，轻松比较和选择最佳结果。
            </p>
          </div>
          <div className="flex flex-col items-center rounded-lg border p-6 text-center">
            <div className="bg-primary/10 mb-4 rounded-full p-3">
              <Zap className="text-primary h-6 w-6" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">实时预览</h3>
            <p className="text-muted-foreground">
              通过响应式设备模拟立即预览你生成的 HTML，确保在所有设备上完美显示。
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto text-center">
          <h2 className="mb-6 text-3xl font-bold">准备好开始使用了吗？</h2>
          <p className="mb-8 text-xl">立即注册并开始创建令人惊叹的 Tailwind CSS 组件。</p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="gap-2">
              免费注册 <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Layers className="text-primary h-5 w-5" />
              <span className="font-semibold">LiveCanvas Builder</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} LiveCanvas Builder. 基于 MIT 许可。
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
