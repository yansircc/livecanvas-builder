'use client'

import { User } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useSession } from '@/lib/auth-client'

export function UserAuthMenu() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  const navigateToSignIn = () => {
    setAuthDialogOpen(false)
    router.push('/signin')
  }

  const navigateToSignUp = () => {
    setAuthDialogOpen(false)
    router.push('/signup')
  }

  // Loading state
  if (isPending) {
    return <Skeleton className="h-9 w-9 rounded-full" />
  }

  // User is authenticated
  if (session?.user) {
    const userInitial = session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'

    return (
      <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0" asChild>
        <Link href="/profile">
          <Avatar className="h-9 w-9">
            {session.user.image ? (
              <Image src={session.user.image} alt={session.user.name || 'User'} fill />
            ) : (
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userInitial.toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
        </Link>
      </Button>
    )
  }

  // User is not authenticated
  return (
    <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <User className="h-4 w-4" />
          <span>登录</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>认证</DialogTitle>
          <DialogDescription>
            登录到您的账户或创建一个新账户以保存您的工作并访问更多功能。
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-4">
          <Button onClick={navigateToSignIn} className="w-full">
            登录
          </Button>
          <Button onClick={navigateToSignUp} variant="outline" className="w-full">
            创建账户
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
