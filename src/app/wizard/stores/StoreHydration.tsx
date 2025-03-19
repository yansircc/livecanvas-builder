'use client'

import { useEffect, useState } from 'react'
import { useTailwindStore } from './tailwindStore'

export function StoreHydration() {
  const [_isHydrated, setIsHydrated] = useState(false)

  // 等待存储水合
  useEffect(() => {
    // zustand 持久化完成时的回调
    const unsubFinishHydration = useTailwindStore.persist.onFinishHydration(() => {
      console.log('Store hydration completed')
      setIsHydrated(true)
    })

    // 检查是否已经水合
    if (useTailwindStore.persist.hasHydrated()) {
      console.log('Store was already hydrated')
      setIsHydrated(true)
    } else {
      // 手动触发水合过程
      console.log('Manually triggering store hydration')

      // 确保异步代码不会抛出错误
      const tryHydrate = async () => {
        try {
          await useTailwindStore.persist.rehydrate()
        } catch (e) {
          console.error('Hydration error:', e)
        }
      }

      void tryHydrate()
    }

    // 组件卸载时清理事件监听器
    return () => {
      unsubFinishHydration()
    }
  }, [])

  // 这只是一个实用组件，没有 UI 输出
  return null
}
