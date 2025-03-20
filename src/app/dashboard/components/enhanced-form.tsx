'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CircleFadingPlus, Folder, InfoIcon, Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Form, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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
  isFormDisabled?: boolean
  currentTaskId?: string | null
}

interface FormValues {
  message: string
  includeContext: boolean
}

// Client-only component - Display model price info
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
          <span>
            当前模型价格: 输入 ${priceInfo.input}/百万 tokens, 输出 ${priceInfo.output}/百万 tokens
          </span>
        </FormDescription>
      )
    }),
  { ssr: false },
)

// Main form component
const EnhancedFormClient = ({
  onSubmit,
  isLoading,
  advices,
  onAdviceClick,
  initialMessage = '',
  isFormDisabled = false,
}: EnhancedFormProps) => {
  const { model, context, setState } = useAppStore()
  const [isClient, setIsClient] = useState(false)
  const [_isLoadingContext, setIsLoadingContext] = useState(false)
  const [localContext, setLocalContext] = useState(context)
  const hasContext = Boolean(localContext && localContext.trim().length > 0)

  // Ensure client-side rendering only
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch context from API if not available in app store
  useEffect(() => {
    const fetchUserContext = async () => {
      // If context is already available in app store, use it
      if (context && context.trim().length > 0) {
        setLocalContext(context)
        return
      }

      try {
        setIsLoadingContext(true)
        const response = await fetch('/api/user/me')

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user && data.user.backgroundInfo) {
            // Update local state and app store with background info
            setLocalContext(data.user.backgroundInfo)
            setState('context', data.user.backgroundInfo)
          }
        } else {
          console.error('Failed to fetch user context:', response.statusText)
        }
      } catch (error) {
        console.error('Error fetching user context:', error)
      } finally {
        setIsLoadingContext(false)
      }
    }

    // Only fetch if we're on the client and don't have context yet
    if (isClient && (!context || context.trim().length === 0)) {
      void fetchUserContext()
    }
  }, [isClient, context, setState])

  // Initialize form with values from store
  const form = useForm<FormValues>({
    defaultValues: {
      message: initialMessage,
      includeContext: hasContext,
    },
  })

  // Update message when initialMessage changes
  useEffect(() => {
    if (initialMessage) {
      form.setValue('message', initialMessage)
    } else {
      form.setValue('message', '')
    }
  }, [initialMessage, form])

  const handleFormSubmit = form.handleSubmit((data) => {
    // Prepare the complete form data with values from the app store
    const completeData = {
      message: data.message,
      includeContext: data.includeContext,
      context: localContext,
    }

    onSubmit(completeData)
  })

  // Handle advice click
  const handleAdviceClickInternal = (advice: string) => {
    const currentMessage = form.getValues('message')
    const newMessage = currentMessage ? `${currentMessage}\n${advice}` : advice
    form.setValue('message', newMessage, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })

    // Call external handler if provided
    if (onAdviceClick) {
      onAdviceClick(advice)
    }
  }

  // Handle model change
  const handleModelChange = (value: string) => {
    setState('model', value)
  }

  // If not client, return a loading placeholder
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
            <p className="text-xs text-zinc-500 dark:text-zinc-400">使用AI创建精美的HTML组件</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-6">
              {/* Model selection */}
              <div className="space-y-2">
                <FormLabel className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  AI 模型
                </FormLabel>
                <Select value={model} onValueChange={handleModelChange} disabled={isFormDisabled}>
                  <SelectTrigger
                    className={cn('w-full', isFormDisabled && 'cursor-not-allowed opacity-50')}
                  >
                    <SelectValue placeholder="选择AI模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ModelPriceInfo modelId={model} />
              </div>

              {/* Prompt field with integrated context toggle */}
              <div className="relative flex flex-col">
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        提示词
                      </FormLabel>
                      <div className="relative">
                        <div className="overflow-hidden">
                          <Textarea
                            placeholder="描述您想要生成的HTML..."
                            className={cn(
                              'h-[150px] w-full resize-none rounded-xl rounded-b-none border-0 bg-zinc-100 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none dark:bg-zinc-800 dark:text-zinc-100',
                              isFormDisabled && 'cursor-not-allowed opacity-50',
                            )}
                            style={{ boxShadow: 'none' }}
                            disabled={isFormDisabled}
                            {...field}
                          />
                        </div>
                        <div className="h-12 rounded-b-xl bg-zinc-100 dark:bg-zinc-800">
                          <div className="absolute bottom-3 left-3 flex items-center gap-2">
                            {/* <label className="cursor-pointer rounded-lg bg-zinc-200/50 p-2 dark:bg-zinc-700/50">
                              <input type="file" className="hidden" />
                              <Paperclip className="h-4 w-4 text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300" />
                            </label> */}
                            <FormField
                              control={form.control}
                              name="includeContext"
                              render={({ field: contextField }) => (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <button
                                        type="button"
                                        onClick={() => contextField.onChange(!contextField.value)}
                                        className={cn(
                                          'flex h-8 cursor-pointer items-center gap-2 rounded-full border px-1.5 py-1 transition-all',
                                          contextField.value && hasContext
                                            ? 'border-sky-400 bg-sky-500/15 text-sky-500'
                                            : contextField.value && !hasContext
                                              ? 'border-amber-400 bg-amber-500/15 text-amber-500'
                                              : 'border-transparent bg-zinc-200/50 text-zinc-500 hover:text-zinc-700 dark:bg-zinc-700/50 dark:text-zinc-400 dark:hover:text-zinc-300',
                                        )}
                                      >
                                        <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                                          <motion.div
                                            animate={{
                                              rotate: contextField.value ? 180 : 0,
                                              scale: contextField.value ? 1.1 : 1,
                                            }}
                                            whileHover={{
                                              rotate: contextField.value ? 180 : 15,
                                              scale: 1.1,
                                              transition: {
                                                type: 'spring',
                                                stiffness: 300,
                                                damping: 10,
                                              },
                                            }}
                                            transition={{
                                              type: 'spring',
                                              stiffness: 260,
                                              damping: 25,
                                            }}
                                          >
                                            {contextField.value && !hasContext ? (
                                              <InfoIcon
                                                className={cn('h-4 w-4', 'text-amber-500')}
                                              />
                                            ) : (
                                              <CircleFadingPlus
                                                className={cn(
                                                  'h-4 w-4',
                                                  contextField.value && hasContext
                                                    ? 'text-sky-500'
                                                    : 'text-inherit',
                                                )}
                                              />
                                            )}
                                          </motion.div>
                                        </div>
                                        <AnimatePresence>
                                          {contextField.value && (
                                            <motion.span
                                              initial={{ width: 0, opacity: 0 }}
                                              animate={{
                                                width: 'auto',
                                                opacity: 1,
                                              }}
                                              exit={{ width: 0, opacity: 0 }}
                                              transition={{ duration: 0.2 }}
                                              className={cn(
                                                'shrink-0 overflow-hidden text-sm whitespace-nowrap',
                                                hasContext ? 'text-sky-500' : 'text-amber-500',
                                              )}
                                            >
                                              背景信息
                                            </motion.span>
                                          )}
                                        </AnimatePresence>
                                      </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs">
                                      {hasContext ? (
                                        <div className="max-h-[200px] overflow-y-auto text-xs">
                                          <p className="mb-1 font-medium">背景信息:</p>
                                          <p className="whitespace-pre-wrap">{localContext}</p>
                                        </div>
                                      ) : (
                                        <p className="text-xs">
                                          你尚未设置背景信息。请在个人资料页面添加背景信息，以便AI更好地理解你的需求。
                                        </p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            />
                          </div>
                          <div className="absolute right-3 bottom-3">
                            <button
                              type="submit"
                              disabled={isLoading || isFormDisabled}
                              className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                                isLoading || isFormDisabled ? 'cursor-not-allowed opacity-70' : '',
                                field.value
                                  ? 'bg-sky-500/15 text-sky-500'
                                  : 'bg-zinc-200/50 text-zinc-500 hover:text-zinc-700 dark:bg-zinc-700/50 dark:text-zinc-400 dark:hover:text-zinc-300',
                              )}
                            >
                              {isLoading ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Suggestions */}
              {advices.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">建议:</h3>
                  <div className="flex flex-wrap gap-2">
                    {advices.map((advice) => (
                      <button
                        key={advice}
                        type="button"
                        onClick={() => handleAdviceClickInternal(advice)}
                        className="rounded-xl bg-zinc-100 px-3 py-1.5 text-left text-sm text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                      >
                        {advice}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

// Export client-only component
export const EnhancedForm = dynamic(() => Promise.resolve(EnhancedFormClient), { ssr: false })
