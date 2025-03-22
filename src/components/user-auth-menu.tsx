'use client'

import { User } from 'lucide-react'
import { useEffect, useState } from 'react'
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
import { decodeJwtToken, getJwtToken, isAuthenticated } from '@/lib/jwt-client'

interface UserData {
  id: string
  name?: string
  email?: string
  image?: string | null
}

export function UserAuthMenu() {
  const router = useRouter()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    async function loadUserData() {
      try {
        // Check if user is authenticated
        const authenticated = await isAuthenticated()

        if (authenticated) {
          // Get JWT token
          const token = await getJwtToken()

          if (token) {
            // Decode JWT payload using our utility function
            const payload = decodeJwtToken(token)

            if (payload) {
              setUserData({
                id: payload.id,
                name: payload.name,
                email: payload.email,
                image: payload.image || null,
              })
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void loadUserData() // Use void operator to explicitly mark promise as ignored
  }, [])

  const navigateToSignIn = () => {
    setAuthDialogOpen(false)
    router.push('/signin')
  }

  const navigateToSignUp = () => {
    setAuthDialogOpen(false)
    router.push('/signup')
  }

  // Loading state
  if (isLoading) {
    return <Skeleton className="h-9 w-9 rounded-full" />
  }

  // User is authenticated
  if (userData) {
    const userInitial = userData.name?.charAt(0) || userData.email?.charAt(0) || 'U'

    return (
      <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0" asChild>
        <Link href="/profile">
          <Avatar className="h-9 w-9">
            {userData.image ? (
              <Image src={userData.image} alt={userData.name || 'User'} fill />
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
            登录到你的账户或创建一个新账户以保存你的工作并访问更多功能。
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
