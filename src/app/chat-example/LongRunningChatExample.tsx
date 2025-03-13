'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { pollTaskStatus, type TaskStatusResponse } from '@/utils/task-status'

// 定义调试信息的类型
interface DebugInfo {
  taskId?: string
  status?: string
  statusUpdate?: TaskStatusResponse
  finalStatus?: TaskStatusResponse
  manualCheck?: TaskStatusResponse
  pollError?: unknown
  error?: unknown
  [key: string]: any // 允许添加其他属性
}

export function LongRunningChatExample() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<{
    code: string
    advices: string[]
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle')
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!prompt.trim()) return

    setLoading(true)
    setError(null)
    setStatus('processing')
    setDebugInfo(null)

    try {
      console.log('Submitting request to chat API')

      // Make the initial request to the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: prompt,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Received response from chat API:', data)

      // 保存调试信息
      setDebugInfo(data)

      // Check if we have a task ID
      if (data.taskId && data.status === 'processing') {
        setTaskId(data.taskId)
        console.log(`Task started with ID: ${data.taskId}`)

        try {
          // Poll for the task status
          const finalStatus = await pollTaskStatus(data.taskId, {
            // Update the UI with status updates
            onUpdate: (update) => {
              console.log('Task status update:', update)
              setStatus(update.status)
              // 更新调试信息
              setDebugInfo((prev: DebugInfo | null) => ({ ...prev, statusUpdate: update }))
            },
            // 设置较长的超时时间
            timeout: 10 * 60 * 1000, // 10 minutes
            // 增加轮询间隔，减少请求频率
            interval: 3000, // 3 seconds
          })

          console.log('Final task status:', finalStatus)

          // 更新调试信息
          setDebugInfo((prev: DebugInfo | null) => ({ ...prev, finalStatus }))

          // Once completed, update the result
          if (finalStatus.status === 'completed' && finalStatus.output) {
            setResult({
              code: finalStatus.output.code,
              advices: finalStatus.output.advices,
            })
            setStatus('completed')
          } else if (finalStatus.status === 'error') {
            setError(`Task failed: ${finalStatus.error || 'Unknown error'}`)
            setStatus('error')
          }
        } catch (pollError) {
          console.error('Error polling for task status:', pollError)
          setError(
            `Error checking task status: ${pollError instanceof Error ? pollError.message : String(pollError)}`,
          )
          setStatus('error')
          setDebugInfo((prev: DebugInfo | null) => ({ ...prev, pollError }))
        }
      } else {
        // If we somehow got an immediate result
        setResult({
          code: data.code,
          advices: data.advices,
        })
        setStatus('completed')
      }
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      setStatus('error')
      setDebugInfo({ error: err })
    } finally {
      setLoading(false)
    }
  }

  // 手动检查任务状态的函数
  const checkTaskStatus = async () => {
    if (!taskId) return

    setStatus('processing')

    try {
      const status = await pollTaskStatus(taskId, {
        // 只检查一次，不持续轮询
        timeout: 10000, // 10 seconds
        interval: 0,
      })

      console.log('Manual task status check:', status)
      setDebugInfo((prev: DebugInfo | null) => ({ ...prev, manualCheck: status }))

      if (status.status === 'completed' && status.output) {
        setResult({
          code: status.output.code,
          advices: status.output.advices,
        })
        setStatus('completed')
      } else if (status.status === 'error') {
        setError(`Task failed: ${status.error || 'Unknown error'}`)
        setStatus('error')
      } else {
        setStatus('processing')
      }
    } catch (error) {
      console.error('Error checking task status:', error)
      setError(
        `Error checking task status: ${error instanceof Error ? error.message : String(error)}`,
      )
      setStatus('error')
    }
  }

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Chat Generation Example</CardTitle>
        <CardDescription>
          Generate HTML content using Trigger.dev tasks that bypass Vercel&apos;s 60-second timeout
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Your prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the HTML content you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={loading}
            />
          </div>

          <Button type="submit" disabled={loading || !prompt.trim()}>
            {loading ? 'Generating...' : 'Generate HTML'}
          </Button>
        </form>

        {status === 'processing' && taskId && (
          <div className="bg-muted mt-4 rounded-md p-4">
            <p className="text-sm">Processing your request... (Task ID: {taskId})</p>
            <div className="bg-muted-foreground/20 mt-2 h-1 w-full overflow-hidden rounded-full">
              <div className="bg-primary h-full w-1/2 animate-pulse rounded-full"></div>
            </div>

            {/* 添加手动检查按钮 */}
            <div className="mt-2 flex justify-end">
              <Button variant="outline" size="sm" onClick={checkTaskStatus} className="text-xs">
                Check Status
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive mt-4 rounded-md p-4">
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-lg font-medium">Generated HTML</h3>
              <pre className="bg-muted mt-2 overflow-auto rounded-md p-4 text-xs">
                {result.code}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium">Advices</h3>
              <ul className="mt-2 space-y-2">
                {result.advices.map((advice, index) => (
                  <li key={index} className="bg-muted rounded-md p-2 text-sm">
                    {advice}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 调试信息 */}
        {debugInfo && (
          <div className="mt-6 border-t pt-4">
            <details>
              <summary className="text-muted-foreground cursor-pointer text-sm font-medium">
                Debug Information
              </summary>
              <div className="bg-muted mt-2 overflow-auto rounded-md p-4">
                <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            </details>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <p className="text-muted-foreground text-sm">
          Status: {status.charAt(0).toUpperCase() + status.slice(1)}
        </p>
        {taskId && <p className="text-muted-foreground text-xs">Task ID: {taskId}</p>}
      </CardFooter>
    </Card>
  )
}
