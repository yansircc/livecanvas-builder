'use client'

import { Folder, Info, MessageSquare, Settings, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { ControllerRenderProps } from 'react-hook-form'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { getModelPrice, MODELS, type ModelId } from '@/lib/models'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/use-app-store'

export const MAX_CONTEXT_LENGTH = 3000

interface EnhancedFormProps {
  onSubmit: (data: FormValues) => void
  isLoading: boolean
  advices: string[]
  onAdviceClick: (advice: string) => void
  initialMessage?: string
}

interface FormValues {
  message: string
  model: ModelId
  apiKey: string
  context: string
}

// 纯客户端组件 - 显示模型价格信息
const ModelPriceInfo = dynamic(
  () =>
    Promise.resolve(({ modelId }: { modelId: ModelId }) => {
      const [priceInfo, setPriceInfo] = useState<{ input: number; output: number } | null>(null)

      useEffect(() => {
        if (modelId) {
          const price = getModelPrice(modelId)
          setPriceInfo(price || null)
        }
      }, [modelId])

      if (!priceInfo) return null

      return (
        <FormDescription className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
          <Info className="h-3 w-3" />
          <span>
            当前模型价格: 输入 ${priceInfo.input}/M tokens, 输出 ${priceInfo.output}/M tokens
          </span>
        </FormDescription>
      )
    }),
  { ssr: false },
)

// 纯客户端组件 - 字符计数器
const CharacterCounter = dynamic(
  () =>
    Promise.resolve(({ value, maxLength }: { value: string; maxLength: number }) => {
      const [count, setCount] = useState(0)

      useEffect(() => {
        setCount(value?.length || 0)
      }, [value])

      return (
        <div
          className={`absolute right-2 bottom-2 text-xs ${
            count > maxLength ? 'text-destructive font-medium' : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          {count}/{maxLength}
        </div>
      )
    }),
  { ssr: false },
)

// 上下文字段组件
function ContextField({
  field,
  setState,
}: {
  field: ControllerRenderProps<FormValues, 'context'>
  setState: (key: 'context', value: string) => void
}) {
  return (
    <FormItem className="space-y-2">
      <FormLabel className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        背景信息
      </FormLabel>
      <FormControl>
        <div className="relative">
          <Textarea
            placeholder="输入背景信息或上下文，用于所有生成..."
            className="min-h-[80px] w-full resize-y rounded-xl border-0 bg-zinc-100 p-4 text-sm text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-200 focus:outline-hidden dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-zinc-700"
            maxLength={MAX_CONTEXT_LENGTH}
            {...field}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CONTEXT_LENGTH) {
                field.onChange(e)
                // 显式更新存储
                setState('context', e.target.value)
              }
            }}
          />
          <CharacterCounter value={field.value} maxLength={MAX_CONTEXT_LENGTH} />
        </div>
      </FormControl>
      <FormDescription className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
        <Info className="h-3 w-3" />
        这个背景信息将被保存并在所有未来的生成中使用（最多 {MAX_CONTEXT_LENGTH} 个字符）
      </FormDescription>
    </FormItem>
  )
}

// 主表单组件
const EnhancedFormClient = ({
  onSubmit,
  isLoading,
  advices,
  onAdviceClick,
  initialMessage = '',
}: EnhancedFormProps) => {
  const { apiKey, model, context, setState } = useAppStore()
  const [activeTab, setActiveTab] = useState('prompt')
  const [isClient, setIsClient] = useState(false)

  // 确保只在客户端渲染
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 使用存储中的值初始化表单
  const form = useForm<FormValues>({
    defaultValues: {
      message: initialMessage,
      model: model || (MODELS?.[0]?.id ?? 'anthropic/claude-3-7-sonnet-20250219'),
      apiKey: apiKey ?? '',
      context: context ?? '',
    },
  })

  // 当存储值更改时更新表单
  useEffect(() => {
    if (apiKey !== null) {
      form.setValue('apiKey', apiKey)
    }
    if (model) {
      form.setValue('model', model)
    }
    if (context !== undefined) {
      form.setValue('context', context)
    }
  }, [apiKey, model, context, form])

  // 当表单值更改时更新存储
  useEffect(() => {
    const subscription = form.watch((value) => {
      // 仅在值实际更改时更新
      if (value.apiKey !== undefined && value.apiKey !== apiKey) {
        setState('apiKey', value.apiKey || null)
      }
      if (value.model !== undefined && value.model !== model) {
        setState('model', value.model)
      }
      if (value.context !== undefined && value.context !== context) {
        setState('context', value.context)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, setState, apiKey, model, context])

  // 当初始消息更改时更新消息
  useEffect(() => {
    if (initialMessage) {
      form.setValue('message', initialMessage)
    }
  }, [initialMessage, form])

  const handleFormSubmit = form.handleSubmit((data) => {
    onSubmit(data)
  })

  // 处理建议点击的方法
  const handleAdviceClickInternal = (advice: string) => {
    const currentMessage = form.getValues('message')
    const newMessage = currentMessage ? `${currentMessage}\n${advice}` : advice
    form.setValue('message', newMessage, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })

    // 如果提供了外部处理程序，也调用它
    if (onAdviceClick) {
      onAdviceClick(advice)
    }
  }

  // 如果不是客户端，返回一个加载占位符
  if (!isClient) {
    return (
      <div
        className={cn(
          'w-full',
          'group relative overflow-hidden',
          'bg-white dark:bg-zinc-900',
          'border border-zinc-200 dark:border-zinc-800',
          'rounded-2xl transition-all duration-300 hover:shadow-md',
          'min-h-[400px] p-8',
        )}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-1/3 rounded-md bg-zinc-200 dark:bg-zinc-800"></div>
          <div className="h-32 rounded-md bg-zinc-200 dark:bg-zinc-800"></div>
          <div className="h-6 w-1/2 rounded-md bg-zinc-200 dark:bg-zinc-800"></div>
          <div className="h-32 rounded-md bg-zinc-200 dark:bg-zinc-800"></div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'w-full',
        'group relative overflow-hidden',
        'bg-white dark:bg-zinc-900',
        'border border-zinc-200 dark:border-zinc-800',
        'rounded-2xl transition-all duration-300 hover:shadow-md',
      )}
    >
      <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <Folder className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              HTML Canvas Builder
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Create beautiful HTML components with AI
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs
          defaultValue="prompt"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-6 grid grid-cols-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
            <TabsTrigger
              value="prompt"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>提示词</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900"
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>设置</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <TabsContent value="prompt" className="space-y-6">
                {/* 模型选择 */}
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        AI模型
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          // 显式更新存储
                          setState('model', value)
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9 rounded-xl border-0 bg-zinc-100 px-4 text-sm text-zinc-900 focus:ring-2 focus:ring-zinc-200 focus:outline-hidden dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-zinc-700">
                            <SelectValue placeholder="选择一个模型" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MODELS.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <ModelPriceInfo modelId={field.value} />
                    </FormItem>
                  )}
                />

                {/* 上下文字段 */}
                <FormField
                  control={form.control}
                  name="context"
                  render={({ field }) => <ContextField field={field} setState={setState} />}
                />

                {/* 提示字段 */}
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        提示词
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="描述你想要生成的HTML..."
                          className="min-h-[150px] w-full resize-y rounded-xl border-0 bg-zinc-100 p-4 text-sm text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-200 focus:outline-hidden dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-zinc-700"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* 建议 */}
                {advices.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">建议:</h3>
                    <div className="flex flex-wrap gap-2">
                      {advices.map((advice) => (
                        <button
                          key={advice}
                          type="button"
                          onClick={() => handleAdviceClickInternal(advice)}
                          className="rounded-xl bg-zinc-100 px-3 py-1.5 text-sm text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                        >
                          {advice}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                {/* API 密钥字段 */}
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        AI Hub Max API秘钥
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="输入你的AI Hub Max API秘钥..."
                          className="h-9 rounded-xl border-0 bg-zinc-100 px-4 text-sm text-zinc-900 placeholder:text-zinc-500 focus:ring-2 focus:ring-zinc-200 focus:outline-hidden dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-zinc-700"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            // 显式更新存储
                            setState('apiKey', e.target.value || null)
                          }}
                        />
                      </FormControl>
                      <FormDescription className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                        <Info className="h-3 w-3" />
                        你的API秘钥将被保存用于未来的使用
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                <Button
                  type="submit"
                  className="flex h-9 items-center justify-center rounded-xl bg-zinc-900 px-4 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      生成中...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      生成HTML
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </div>
    </div>
  )
}

// 导出纯客户端组件
export const EnhancedForm = dynamic(() => Promise.resolve(EnhancedFormClient), { ssr: false })
