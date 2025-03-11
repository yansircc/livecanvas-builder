'use client'

import { AlertCircle, CheckCircle, Mail } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { resendVerificationEmail } from '@/lib/auth-client'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [isResending, setIsResending] = useState(false)
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleResendVerification = async () => {
    if (!email) return

    setIsResending(true)
    setResendStatus('idle')

    try {
      const result = await resendVerificationEmail(email, '/verify-success')
      if (result.success) {
        setResendStatus('success')
      } else {
        setResendStatus('error')
      }
    } catch (_error) {
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
          </div>
        </CardHeader>
        <CardContent className="px-8">
          <div className="space-y-4">
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              如果没有看到邮件，请检查垃圾邮件文件夹
            </p>

            {resendStatus === 'success' && (
              <Alert className="bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>邮箱已发送</AlertTitle>
                <AlertDescription>我们已向您的邮箱发送了新的验证邮件</AlertDescription>
              </Alert>
            )}

            {resendStatus === 'error' && (
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
            disabled={isResending || !email}
          >
            {isResending ? '发送中...' : '重新发送验证邮件'}
          </Button>
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            已验证？{' '}
            <a
              href="/signin"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              登录
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
