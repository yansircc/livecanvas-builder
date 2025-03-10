import { createAnthropic } from '@ai-sdk/anthropic'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { createOpenAI } from '@ai-sdk/openai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { env } from '@/env'

/**
 * Interface defining the structure of an LLM provider
 */
interface LLM {
  name: string
  availableModels: {
    name: string
    value: string
    price: {
      input: number // Price per million input tokens in USD
      output: number // Price per million output tokens in USD
    }
    canOutputStructuredData: boolean
  }[]
  model: (modelValue: string) => any
}

/**
 * List of available LLM providers with their models and pricing information
 */
export const LLM_LIST: Record<string, LLM> = {
  anthropic: {
    name: 'Anthropic',
    availableModels: [
      {
        name: 'Claude 3.7 Sonnet',
        value: 'claude-3-7-sonnet-20250219',
        price: {
          input: 3.3,
          output: 16.5,
        },
        canOutputStructuredData: true,
      },
      {
        name: 'Claude 3.5 Sonnet',
        value: 'claude-3-5-sonnet-latest',
        price: {
          input: 3.3,
          output: 16.5,
        },
        canOutputStructuredData: true,
      },
    ],
    model: (modelValue: string) => {
      const anthropic = createAnthropic({
        apiKey: env.AI_HUB_MIX_API_KEY,
        baseURL: env.AI_HUB_MIX_ENDPOINT,
      })
      return anthropic(modelValue)
    },
  },
  openai: {
    name: 'OpenAI',
    availableModels: [
      {
        name: 'GPT-4o',
        value: 'gpt-4o',
        price: {
          input: 2.5,
          output: 10,
        },
        canOutputStructuredData: true,
      },
      {
        name: 'GPT-4o Mini',
        value: 'gpt-4o-mini',
        price: {
          input: 0.15,
          output: 0.6,
        },
        canOutputStructuredData: true,
      },
      {
        name: 'o1',
        value: 'o1',
        price: {
          input: 15,
          output: 60,
        },
        canOutputStructuredData: false,
      },
      {
        name: 'o3-mini',
        value: 'o3-mini',
        price: {
          input: 1.1,
          output: 4.4,
        },
        canOutputStructuredData: false,
      },
    ],
    model: (modelValue: string) => {
      const openai = createOpenAI({
        apiKey: env.AI_HUB_MIX_API_KEY,
        baseURL: env.AI_HUB_MIX_ENDPOINT,
      })
      return openai(modelValue)
    },
  },
  google: {
    name: 'Google',
    availableModels: [
      {
        name: 'Gemini 2.0 Flash',
        value: 'gemini-2.0-flash',
        price: {
          input: 0.1,
          output: 0.4,
        },
        canOutputStructuredData: false,
      },
      {
        name: 'Gemini 2.0 Flash Lite',
        value: 'gemini-2.0-flash-lite',
        price: {
          input: 0.076,
          output: 0.304,
        },
        canOutputStructuredData: false,
      },
    ],
    model: (modelValue: string) => {
      const google = createOpenAICompatible({
        name: 'Google',
        apiKey: env.AI_HUB_MIX_API_KEY,
        baseURL: env.AI_HUB_MIX_ENDPOINT,
      })
      return google(modelValue)
    },
  },
  deepseek: {
    name: 'DeepSeek',
    availableModels: [
      {
        name: 'DeepSeek R1',
        value: 'DeepSeek-R1',
        price: {
          input: 0.62,
          output: 2.48,
        },
        canOutputStructuredData: false,
      },
      {
        name: 'DeepSeek V3',
        value: 'DeepSeek-V3',
        price: {
          input: 0.4,
          output: 1.6,
        },
        canOutputStructuredData: false,
      },
    ],
    model: (modelValue: string) => {
      const deepseek = createDeepSeek({
        apiKey: env.AI_HUB_MIX_API_KEY,
        baseURL: env.AI_HUB_MIX_ENDPOINT,
      })
      return deepseek(modelValue)
    },
  },
  qwen: {
    name: 'Qwen',
    availableModels: [
      {
        name: 'Qwen Max',
        value: 'qwen-max-0125',
        price: {
          input: 0.38,
          output: 1.52,
        },
        canOutputStructuredData: false,
      },
      {
        name: 'Qwen 32B',
        value: 'qwen-qwq-32b',
        price: {
          input: 0.14,
          output: 0.56,
        },
        canOutputStructuredData: false,
      },
    ],
    model: (modelValue: string) => {
      const qwen = createOpenAICompatible({
        name: 'Qwen',
        apiKey: env.AI_HUB_MIX_API_KEY,
        baseURL: env.AI_HUB_MIX_ENDPOINT,
      })
      return qwen(modelValue)
    },
  },
}

// Create a flattened list of all models with provider information
export const MODELS = Object.entries(LLM_LIST).flatMap(([providerId, provider]) =>
  provider.availableModels.map((model) => ({
    id: `${providerId}/${model.value}`,
    name: `${provider.name} - ${model.name}`,
    providerId,
    modelValue: model.value,
    price: model.price,
    canOutputStructuredData: model.canOutputStructuredData,
  })),
)

export type ModelId = string

// Helper function to get provider and model value from a combined ID
export function parseModelId(modelId: ModelId): {
  providerId: string
  modelValue: string
} {
  const parts = modelId.split('/')
  // Default to empty strings if the split doesn't produce valid parts
  const providerId = parts[0] ?? ''
  const modelValue = parts[1] ?? ''
  return { providerId, modelValue }
}

// Helper function to get price information for a model
export function getModelPrice(modelId: ModelId): { input: number; output: number } | undefined {
  const model = MODELS.find((m) => m.id === modelId)
  return model?.price
}

// Helper function to check if a model can output structured data
export function canModelOutputStructuredData(modelId: ModelId): boolean {
  const model = MODELS.find((m) => m.id === modelId)
  return model?.canOutputStructuredData ?? false
}
