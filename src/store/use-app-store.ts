import { create, type StateCreator } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ModelId } from '@/lib/models'
import { getDefaultModel, isValidModelId } from '@/lib/models'

interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface Version {
  id: string
  timestamp: number
  code: string | null
  processedHtml: string
  advices: string[]
  prompt: string
  parentId: string | null
  // Complete form data
  formData: {
    message: string
    model: ModelId
    apiKey: string | null
    context: string
  }
}

// 定义可以通过 setState 设置的状态类型
type SettableState = {
  apiKey: string | null
  model: ModelId
  context: string
  isLoading: boolean
  code: string | null
  advices: string[]
  processedHtml: string
  validationResult: ValidationResult
}

interface AppState extends SettableState {
  // 版本控制相关状态
  versions: Version[]
  currentVersionIndex: number

  // 通用状态设置方法
  setState: <K extends keyof SettableState>(key: K, value: SettableState[K]) => void

  // 版本控制方法
  addVersion: (
    prompt: string,
    formData?: {
      message: string
      model: ModelId
      apiKey: string | null
      context: string
    },
  ) => void
  switchToVersion: (index: number) => void

  // 重置方法
  resetState: (options?: {
    keepVersions?: boolean
    keepUserSettings?: boolean
    keepContext?: boolean
  }) => void
}

// 更新持久化配置
type AppPersist = Pick<AppState, 'apiKey' | 'model' | 'context'>

// 获取默认模型 - 使用models.ts中的函数
const getDefaultModelValue = (): ModelId => {
  return getDefaultModel()
}

// 创建自定义存储，添加更好的错误处理
const customStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof window === 'undefined') return null
      return localStorage.getItem(name)
    } catch (error) {
      console.error('Error getting item from localStorage:', error)
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof window === 'undefined') return
      localStorage.setItem(name, value)
    } catch (error) {
      console.error('Error setting item in localStorage:', error)
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(name)
    } catch (error) {
      console.error('Error removing item from localStorage:', error)
    }
  },
}

// 获取初始状态
const getInitialState = (): {
  apiKey: string | null
  model: ModelId
  context: string
} => {
  const defaultModel = getDefaultModelValue()

  // 在服务器端渲染时返回默认值
  if (typeof window === 'undefined') {
    return {
      apiKey: null,
      model: defaultModel,
      context: '',
    }
  }

  try {
    // 尝试从localStorage获取持久化的数据
    const storedData = localStorage.getItem('canvas-builder-storage')
    if (!storedData) {
      return {
        apiKey: null,
        model: defaultModel,
        context: '',
      }
    }

    const parsedData = JSON.parse(storedData)
    const state = parsedData.state || {}

    // 验证持久化的模型ID是否有效
    let modelValue: ModelId = defaultModel
    if (state.model && typeof state.model === 'string') {
      if (isValidModelId(state.model)) {
        modelValue = state.model
      } else {
        console.warn('Persisted model ID is invalid, using default model')
      }
    }

    return {
      apiKey: state.apiKey ?? null,
      model: modelValue,
      context: state.context ?? '',
    }
  } catch (error) {
    console.error('Failed to parse persisted state:', error)
    return {
      apiKey: null,
      model: defaultModel,
      context: '',
    }
  }
}

// 获取初始状态
const initialState = getInitialState()

const stateCreator: StateCreator<AppState, [], [], AppState> = (set, get) => ({
  // 初始状态
  apiKey: initialState.apiKey,
  model: initialState.model,
  context: initialState.context,
  isLoading: false,
  code: null,
  advices: [],
  processedHtml: '',
  validationResult: {
    valid: true,
    errors: [],
  },
  versions: [],
  currentVersionIndex: -1,

  // 通用状态设置方法
  setState: (key, value) => set({ [key]: value }),

  // 版本控制方法
  addVersion: (prompt, formData) => {
    const { code, processedHtml, advices, currentVersionIndex, versions } = get()
    if (!code) return // Don't add version if no code was generated

    // Determine the parent version based on the current index
    const parentId =
      currentVersionIndex >= 0 &&
      currentVersionIndex < versions.length &&
      versions[currentVersionIndex]
        ? versions[currentVersionIndex].id
        : null

    const newVersion: Version = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      code,
      processedHtml,
      advices,
      prompt,
      parentId, // Add parent reference
      formData: formData ?? {
        message: prompt,
        model: get().model,
        apiKey: get().apiKey,
        context: get().context,
      },
    }

    const newVersions = [...get().versions, newVersion]
    set({
      versions: newVersions,
      currentVersionIndex: newVersions.length - 1,
    })
  },

  switchToVersion: (index) => {
    const { versions } = get()
    if (index >= 0 && index < versions.length) {
      const version = versions[index]
      if (version) {
        // Restore all version data
        set({
          currentVersionIndex: index,
          code: version.code,
          processedHtml: version.processedHtml,
          advices: version.advices,
          // Restore form data if available
          ...(version.formData && {
            model: version.formData.model,
            apiKey: version.formData.apiKey,
            context: version.formData.context,
          }),
        })
      }
    }
  },

  // 重置方法
  resetState: (options = {}) => {
    const { keepVersions = false, keepUserSettings = true, keepContext = true } = options

    // 创建新状态对象
    const newState: Partial<AppState> = {
      isLoading: false,
      code: null,
      advices: [],
      processedHtml: '',
      validationResult: {
        valid: true,
        errors: [],
      },
    }

    // 如果不保留版本，则重置版本相关状态
    if (!keepVersions) {
      newState.versions = []
      newState.currentVersionIndex = -1
    }

    // 如果不保留用户设置，则重置用户设置
    if (!keepUserSettings) {
      newState.apiKey = null
      newState.model = getDefaultModelValue()
      newState.context = ''
    }

    // 确保重置上下文，即使保留用户设置
    if (!keepContext) {
      newState.context = ''
    }

    set(newState)
  },
})

const persistConfig = {
  name: 'canvas-builder-storage',
  storage: createJSONStorage(() => customStorage),
  partialize: (state: AppState) =>
    Object.fromEntries(
      Object.entries(state).filter(([key]) => ['apiKey', 'model', 'context'].includes(key)),
    ) as AppPersist,
  // 添加版本号，以便将来可以处理迁移
  version: 1,
  // 仅在客户端环境中启用持久化
  skipHydration: typeof window === 'undefined',
}

// 创建存储
export const useAppStore = create<AppState>()(persist(stateCreator, persistConfig))
