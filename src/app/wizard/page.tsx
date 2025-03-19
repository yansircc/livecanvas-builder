'use client'

import { useEffect, useState } from 'react'
import { ColorShades } from './components/ColorShades'
import { StoreHydration } from './stores/StoreHydration'

export default function TestPage() {
  const [mounted, setMounted] = useState(false)

  // 确保组件仅在客户端渲染
  useEffect(() => {
    setMounted(true)
  }, [])

  // 如果尚未挂载，显示一个基本的加载状态
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-6 p-16">
      {/* 水合 store */}
      <StoreHydration />

      <div className="relative w-full max-w-3xl rounded-lg bg-white p-6 dark:bg-zinc-900">
        <h1 className="mb-6 text-2xl font-bold">Tailwind 设计系统生成器</h1>
        <div className="mb-4 text-sm text-gray-600">
          本工具根据您选择的色值生成 Tailwind 兼容的颜色、字体、按钮样式、边框半径等配置， 遵循
          Tailwind 的颜色渐变模式，确保一致的亮度和饱和度。
        </div>
        <ColorShades />
      </div>
    </div>
  )
}
