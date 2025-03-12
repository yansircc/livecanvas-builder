import { getModelPrice, type ModelId } from '@/lib/models'

// Calculate cost based on token usage and model
export function calculateCost(
  usage: { promptTokens: number; completionTokens: number; totalTokens: number },
  modelId: ModelId,
): { usd: number; cny: number } | undefined {
  const price = getModelPrice(modelId)
  if (!price || !usage) return undefined

  // Price is per million tokens, so divide by 1,000,000
  const inputCostUSD = (usage.promptTokens / 1000000) * price.input
  const outputCostUSD = (usage.completionTokens / 1000000) * price.output
  const totalCostUSD = inputCostUSD + outputCostUSD

  // Fixed exchange rate of 7.3
  const exchangeRate = 7.3
  const totalCostCNY = totalCostUSD * exchangeRate

  return {
    usd: totalCostUSD,
    cny: totalCostCNY,
  }
}
