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
import { fetchWithAuth, getJwtToken } from '@/lib/jwt-client'

/**
 * JWT认证示例组件
 */
export function JwtAuthExample() {
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [protectedData, setProtectedData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')

  // 获取JWT令牌的函数
  const handleGetToken = async () => {
    setLoading(true)
    setError(null)
    setDebugInfo('正在获取令牌...')

    try {
      const newToken = await getJwtToken()
      if (!newToken) {
        throw new Error('获取令牌失败')
      }

      setToken(newToken)
      setProtectedData(null) // 清除之前的保护数据
      setDebugInfo(`令牌已接收: ${newToken.substring(0, 15)}...`)

      // 输出令牌信息
      console.log('Token received:', {
        length: newToken.length,
        format: newToken.includes('.') ? 'JWT format (contains dots)' : 'Unknown format',
        parts: newToken.split('.').length,
      })
    } catch (err) {
      setError('获取令牌失败')
      console.error(err)
      setDebugInfo(`错误: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  // 调用受保护API的函数
  const handleCallProtectedApi = async () => {
    if (!token) {
      setError('无令牌可用。请先获取令牌。')
      return
    }

    setLoading(true)
    setError(null)
    setDebugInfo('正在调用受保护的API...')

    try {
      // 使用fetchWithAuth助手
      const response = await fetchWithAuth('/api/protected')

      setDebugInfo(`API响应状态: ${response.status}`)

      if (!response.ok) {
        let errorMessage = `API请求失败，状态码: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
          console.error('API错误响应:', errorData)
          setDebugInfo(`错误数据: ${JSON.stringify(errorData)}`)
        } catch (e) {
          console.error('解析错误响应失败:', e)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setProtectedData(data)
      setDebugInfo('API调用成功')
    } catch (err: any) {
      setError(err.message || '调用受保护API失败')
      console.error('API调用错误:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>JWT认证示例</CardTitle>
        <CardDescription>测试基于JWT的身份验证和API保护</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Button
              onClick={handleGetToken}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? '加载中...' : '获取JWT令牌'}
            </Button>

            <Button
              onClick={handleCallProtectedApi}
              disabled={loading || !token}
              className="w-full"
            >
              {loading ? '加载中...' : '调用受保护API'}
            </Button>
          </div>

          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          {debugInfo && (
            <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-600">
              <h3 className="mb-1 font-medium">调试信息:</h3>
              <div>{debugInfo}</div>
            </div>
          )}

          {token && (
            <div className="rounded-md bg-blue-50 p-3">
              <h3 className="mb-1 font-medium">JWT令牌:</h3>
              <div className="max-h-20 overflow-auto text-xs break-all text-blue-800">{token}</div>
            </div>
          )}

          {protectedData && (
            <div className="rounded-md bg-gray-50 p-3">
              <h3 className="mb-2 font-medium">保护数据:</h3>
              <pre className="overflow-auto text-xs break-all whitespace-pre-wrap">
                {JSON.stringify(protectedData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="text-xs text-gray-500">
        JWT令牌存储在内存中并包含在Authorization头中
      </CardFooter>
    </Card>
  )
}
