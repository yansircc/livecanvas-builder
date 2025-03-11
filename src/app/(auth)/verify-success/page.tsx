'use client'

import { CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function VerificationSuccessPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <Card className="mx-auto w-[400px] rounded-3xl border-2 border-zinc-100 bg-white shadow-[0_24px_48px_-12px] shadow-zinc-900/10 dark:border-zinc-800/50 dark:bg-[#121212] dark:shadow-black/30">
        <CardHeader className="space-y-4 px-8 pt-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
          </div>
          <div className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold">Email Verified</CardTitle>
            <CardDescription className="text-base text-zinc-500 dark:text-zinc-400">
              Your email has been successfully verified
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-8">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Thank you for verifying your email address. You can now sign in to your account.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 px-8 pb-10">
          <Button className="w-full" onClick={() => router.push('/signin')}>
            Sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
