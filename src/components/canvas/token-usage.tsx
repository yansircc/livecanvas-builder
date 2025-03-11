import { getModelPrice, type ModelId } from '@/lib/models'

export function TokenUsage({
  usage,
  modelId,
}: {
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  modelId: ModelId
}) {
  if (!usage) return null

  const cost = calculateCost(usage, modelId)

  return (
    <div className="mt-2 rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
      <h3 className="mb-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">Token 使用情况</h3>
      <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
        <p>总计: {usage.totalTokens.toLocaleString()} tokens</p>
        <p>提示: {usage.promptTokens.toLocaleString()} tokens</p>
        <p>补全: {usage.completionTokens.toLocaleString()} tokens</p>
        {cost && (
          <p className="mt-1 border-t border-zinc-200 pt-1 dark:border-zinc-700">
            估计费用: {cost.cny.toFixed(4)} 元 (${cost.usd.toFixed(4)})
          </p>
        )}
      </div>
    </div>
  )
}

// 计算成本的函数，汇率固定为 7.3
function calculateCost(
  usage: { promptTokens: number; completionTokens: number; totalTokens: number },
  modelId: ModelId,
): { usd: number; cny: number } | undefined {
  const price = getModelPrice(modelId)
  if (!price || !usage) return undefined

  // 价格是按每百万 token 计算的，所以需要除以 1,000,000
  const inputCostUSD = (usage.promptTokens / 1000000) * price.input
  const outputCostUSD = (usage.completionTokens / 1000000) * price.output
  const totalCostUSD = inputCostUSD + outputCostUSD

  // 汇率固定为 7.3
  const exchangeRate = 7.3
  const totalCostCNY = totalCostUSD * exchangeRate

  return {
    usd: totalCostUSD,
    cny: totalCostCNY,
  }
}
