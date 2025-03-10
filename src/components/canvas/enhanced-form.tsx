'use client'

import { Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
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
import { canModelOutputStructuredData, getModelPrice, MODELS, type ModelId } from '@/lib/models'
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

export function EnhancedForm({
  onSubmit,
  isLoading,
  advices,
  onAdviceClick,
  initialMessage = '',
}: EnhancedFormProps) {
  const { apiKey, model, context, setState } = useAppStore()
  const [activeTab, setActiveTab] = useState('prompt')

  // Initialize form with values from the store
  const form = useForm<FormValues>({
    defaultValues: {
      message: initialMessage,
      model: model || (MODELS?.[0]?.id ?? 'anthropic/claude-3-7-sonnet-20250219'),
      apiKey: apiKey ?? '',
      context: context ?? '',
    },
  })

  // Update form when store values change
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

  // Update store when form values change - use a more robust approach
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Only update if the values have actually changed
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

  // Update message when initialMessage changes
  useEffect(() => {
    if (initialMessage) {
      form.setValue('message', initialMessage)
    }
  }, [initialMessage, form])

  const handleFormSubmit = form.handleSubmit((data) => {
    onSubmit(data)
  })

  // Add a method to handle advice clicks directly in the form
  const handleAdviceClickInternal = (advice: string) => {
    const currentMessage = form.getValues('message')
    const newMessage = currentMessage ? `${currentMessage}\n${advice}` : advice
    form.setValue('message', newMessage, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })

    // Also call the external handler if provided
    if (onAdviceClick) {
      onAdviceClick(advice)
    }
  }

  // Get the current model's price information
  const currentModelId = form.watch('model')
  const currentModelPrice = getModelPrice(currentModelId)
  const supportsStructuredData = canModelOutputStructuredData(currentModelId)

  return (
    <div className="w-full rounded-lg border p-8">
      <Tabs defaultValue="prompt" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 grid grid-cols-2">
          <TabsTrigger value="prompt">提示词</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <TabsContent value="prompt" className="space-y-6">
              {/* Model Selection - Moved to first tab */}
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI模型</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value)
                        // Explicitly update the store when model changes
                        setState('model', value)
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择一个模型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MODELS.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1">
                                <span>{model.name}</span>
                                {model.canOutputStructuredData && (
                                  <span className="ml-1 text-xs text-green-500">✓</span>
                                )}
                              </div>
                              {model.price && (
                                <span className="text-muted-foreground text-xs">
                                  输入: ${model.price.input}/M tokens | 输出: ${model.price.output}
                                  /M tokens
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {currentModelPrice && (
                      <FormDescription>
                        当前模型价格: 输入 ${currentModelPrice.input}/M tokens, 输出 $
                        {currentModelPrice.output}/M tokens
                        <br />
                        {supportsStructuredData ? (
                          <span className="text-green-500">✓ 支持结构化输出</span>
                        ) : (
                          <span className="text-amber-500">
                            ⚠ 不支持结构化输出，将使用文本解析
                          </span>
                        )}
                      </FormDescription>
                    )}
                  </FormItem>
                )}
              />

              {/* Context Field */}
              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>背景信息</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Textarea
                          placeholder="输入背景信息或上下文，用于所有生成..."
                          className="min-h-[80px] resize-y"
                          maxLength={MAX_CONTEXT_LENGTH}
                          {...field}
                          onChange={(e) => {
                            if (e.target.value.length <= MAX_CONTEXT_LENGTH) {
                              field.onChange(e)
                              // Explicitly update the store
                              setState('context', e.target.value)
                            }
                          }}
                        />
                        <div
                          className={`absolute right-2 bottom-2 text-xs ${
                            (field.value?.length || 0) > MAX_CONTEXT_LENGTH
                              ? 'text-destructive font-medium'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {field.value?.length || 0}/{MAX_CONTEXT_LENGTH}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      这个背景信息将被保存并在所有未来的生成中使用（最多 {MAX_CONTEXT_LENGTH}{' '}
                      个字符）
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Prompt Field */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>提示词</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="描述你想要生成的HTML..."
                        className="min-h-[150px] resize-y"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Suggestions */}
              {advices.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">建议:</h3>
                  <div className="flex flex-wrap gap-2">
                    {advices.map((advice) => (
                      <button
                        key={advice}
                        type="button"
                        onClick={() => handleAdviceClickInternal(advice)}
                        className="bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-md px-3 py-1.5 text-sm transition-colors"
                      >
                        {advice}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
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
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {/* API Key Field */}
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Hub Max API秘钥</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="输入你的AI Hub Max API秘钥..."
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          // Explicitly update the store
                          setState('apiKey', e.target.value || null)
                        }}
                      />
                    </FormControl>
                    <FormDescription>你的API秘钥将被保存用于未来的使用</FormDescription>
                  </FormItem>
                )}
              />
            </TabsContent>
          </form>
        </Form>
      </Tabs>
    </div>
  )
}
