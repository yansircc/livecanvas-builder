'use client'

import { AlertCircle, CheckCircle, Mail } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
      const result = await resendVerificationEmail(email, '/verify-email')
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
            <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
            <CardDescription className="text-base text-zinc-500 dark:text-zinc-400">
              We&apos;ve sent a verification link to{' '}
              <span className="font-medium text-zinc-900 dark:text-zinc-100">{email}</span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8">
          <div className="space-y-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Please check your email and click the verification link to complete your registration.
              If you don&apos;t see the email, check your spam folder.
            </p>

            {resendStatus === 'success' && (
              <Alert className="bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Email sent</AlertTitle>
                <AlertDescription>
                  We&apos;ve sent a new verification email to your inbox.
                </AlertDescription>
              </Alert>
            )}

            {resendStatus === 'error' && (
              <Alert className="bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>
                  We couldn&apos;t send the verification email. Please try again later.
                </AlertDescription>
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
            {isResending ? 'Sending...' : 'Resend verification email'}
          </Button>
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            Already verified?{' '}
            <a
              href="/signin"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
