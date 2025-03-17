import { useCallback } from 'react'
import { useAppStore } from '@/store/use-app-store'
import { type ConversationHistoryItem } from '@/utils/task-manager'

export function useConversationHistory() {
  const { versions, currentVersionIndex } = useAppStore()

  // Build conversation history
  const buildConversationHistory = useCallback((): ConversationHistoryItem[] => {
    const history: ConversationHistoryItem[] = []

    if (currentVersionIndex >= 0 && versions.length > 0) {
      const currentVersion = versions[currentVersionIndex]
      if (currentVersion) {
        history.push({
          prompt: currentVersion.prompt,
          response: currentVersion.code ?? '',
        })
      }
      console.log('优化上下文: 仅发送最新的AI响应')
    }

    return history
  }, [currentVersionIndex, versions])

  return {
    buildConversationHistory,
  }
}
