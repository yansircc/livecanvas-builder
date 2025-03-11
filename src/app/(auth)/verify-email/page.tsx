'use client'

import { AlertCircle, CheckCircle, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { resendVerificationEmail } from '@/lib/auth-client'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [isResending, setIsResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Validate that we have an email parameter
  useEffect(() => {
    if (!email) {
      setErrorMessage('未提供邮箱地址，请返回注册页面重试')
    }
  }, [email])

  const handleResendVerification = async () => {
    if (!email) return

    setIsResending(true)
    setResendStatus('idle')
    setErrorMessage(null)

    try {
      const result = await resendVerificationEmail(email, '/verify-success')
      if (result.success) {
        setResendStatus('success')
      } else {
        // Check for specific error types
        if (result.error && typeof result.error === 'object' && 'status' in result.error) {
          const error = result.error as { status?: number; message?: string }

          if (error.status === 404) {
            setErrorMessage('该邮箱地址不存在，请返回注册页面重试')
          } else if (error.status === 409) {
            setErrorMessage('该邮箱已经验证过，请直接登录')
            // Redirect to signin after a short delay
            setTimeout(() => router.push('/signin'), 3000)
          } else {
            setErrorMessage(error.message || '发送验证邮件失败，请稍后再试')
          }
        } else {
          setResendStatus('error')
        }
      }
    } catch (error) {
      setResendStatus('error')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <Card className="mx-auto w-[400px] rounded-3xl border-2 border-zinc-100 bg-white shadow-[0_24px_48px_-12px] shadow-zinc-900/10 dark:border-zinc-800/50 dark:bg-[#121212] dark:shadow-black/30">
        <CardHeader className="space-y-4 px-8 pt-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <div className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold">验证您的邮箱</CardTitle>
            {email && <p className="text-muted-foreground text-sm">{email}</p>}
          </div>
        </CardHeader>
        <CardContent className="px-8">
          <div className="space-y-4">
            {!errorMessage && (
              <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                我们已向您的邮箱发送了验证链接。如果没有看到邮件，请检查垃圾邮件文件夹。
              </p>
            )}

            {errorMessage && (
              <Alert className="bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>出错了</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            {resendStatus === 'success' && (
              <Alert className="bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>邮箱已发送</AlertTitle>
                <AlertDescription>我们已向您的邮箱发送了新的验证邮件</AlertDescription>
              </Alert>
            )}

            {resendStatus === 'error' && !errorMessage && (
              <Alert className="bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>发生了错误</AlertTitle>
                <AlertDescription>我们无法发送验证邮件。请稍后再试。</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 px-8 pb-10">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResendVerification}
            disabled={isResending || !email || !!errorMessage}
          >
            {isResending ? '发送中...' : '重新发送验证邮件'}
          </Button>
          <div className="flex w-full justify-between">
            <Button
              variant="link"
              className="text-xs text-zinc-500 dark:text-zinc-400"
              onClick={() => router.push('/signup')}
            >
              返回注册
            </Button>
            <Button
              variant="link"
              className="text-xs text-zinc-500 dark:text-zinc-400"
              onClick={() => router.push('/signin')}
            >
              已验证？登录
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
