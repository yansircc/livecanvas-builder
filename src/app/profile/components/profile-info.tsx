'use client'

import { Edit, Save, Upload, User, X } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateSessionData } from '@/lib/session-utils'
import { useAppStore } from '@/store/use-app-store'

// Define the maximum length for background info
export const MAX_BACKGROUND_LENGTH = 3000

interface ProfileInfoProps {
  user:
    | {
        id: string
        name: string
        email: string
        image?: string | null
        backgroundInfo?: string | null
      }
    | null
    | undefined
}

interface UpdateProfileResponse {
  success: boolean
  message?: string
  user?: {
    id: string
    name: string
    email: string
    image?: string | null
    backgroundInfo?: string | null
  }
}

interface UploadResponse {
  success: boolean
  url?: string
  error?: string
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  const { setState } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [name, setName] = useState(user?.name || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.image || '')
  const [backgroundInfo, setBackgroundInfo] = useState(user?.backgroundInfo || '')
  const [isUploading, setIsUploading] = useState(false)
  const [isLoadingUserData, setIsLoadingUserData] = useState(true)

  // Fetch complete user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoadingUserData(true)
        const response = await fetch('/api/user/me')

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.user) {
            // Update state with complete user data
            setName(data.user.name || '')
            setAvatarUrl(data.user.image || '')
            setBackgroundInfo(data.user.backgroundInfo || '')

            // Also update the context in the app store
            setState('context', data.user.backgroundInfo || '')
          }
        } else {
          console.error('Failed to fetch user data:', response.statusText)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoadingUserData(false)
      }
    }

    if (user?.id) {
      void fetchUserData()
    } else {
      setIsLoadingUserData(false)
    }
  }, [user?.id, setState])

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('请上传一个图片文件')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小应该小于5MB')
      return
    }

    setIsUploading(true)

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = (error) => reject(error as unknown as Error)
      })

      // Upload to server API endpoint instead of direct BunnyCDN call
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ base64Image: base64 }),
      })

      const data = (await response.json()) as UploadResponse

      if (data.success && data.url) {
        setAvatarUrl(data.url)
        toast.success('头像上传成功')
      } else {
        toast.error(data.error || '头像上传失败')
      }
    } catch (error) {
      console.error('头像上传失败:', error)
      toast.error('头像上传失败')
    } finally {
      setIsUploading(false)
    }
  }

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!user) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          image: avatarUrl,
          backgroundInfo,
        }),
      })

      const data = (await response.json()) as UpdateProfileResponse

      if (data.success) {
        toast.success('个人信息更新成功')

        // Update the context in the app store
        setState('context', backgroundInfo)

        // Show a loading toast while refreshing the session
        const loadingToast = toast.loading('更新会话数据...')

        // Update the session data and refresh the page
        await updateSessionData()

        // Dismiss the loading toast
        toast.dismiss(loadingToast)

        // Exit edit mode
        setIsEditMode(false)
      } else {
        toast.error(data.message || '个人信息更新失败')
      }
    } catch (error) {
      console.error('个人信息更新失败:', error)
      toast.error('个人信息更新失败')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle background info change with character limit
  const handleBackgroundInfoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= MAX_BACKGROUND_LENGTH) {
      setBackgroundInfo(value)
    }
  }

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditMode) {
      // If canceling edit, reset form values to original user data
      setName(user?.name || '')
      setAvatarUrl(user?.image || '')
      setBackgroundInfo(user?.backgroundInfo || '')
    }
    setIsEditMode(!isEditMode)
  }

  if (!user) {
    return <div>请登录以查看您的个人信息</div>
  }

  if (isLoadingUserData) {
    return (
      <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <CardHeader>
          <CardTitle>个人信息</CardTitle>
          <CardDescription>正在加载您的个人信息...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>个人信息</CardTitle>
          <CardDescription>
            {isEditMode ? '编辑您的个人信息和头像' : '查看您的个人信息和头像'}
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleEditMode}
          className="flex items-center gap-1.5"
          disabled={isLoading}
        >
          {isEditMode ? (
            <>
              <X className="h-4 w-4" />
              取消
            </>
          ) : (
            <>
              <Edit className="h-4 w-4" />
              编辑
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar upload */}
        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-4">
          <div className="relative h-24 w-24 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={name || 'User avatar'} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-12 w-12 text-zinc-400" />
              </div>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <div className="text-sm text-zinc-700 dark:text-zinc-300">
              {isEditMode ? '上传一个新的头像图片。JPG, PNG或GIF, 最大5MB。' : '您的个人头像'}
            </div>
            {isEditMode && (
              <div className="flex items-center space-x-2">
                <Label
                  htmlFor="avatar-upload"
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {isUploading ? '上传中...' : '上传'}
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading || !isEditMode}
                />
                {avatarUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAvatarUrl('')}
                    disabled={isUploading || !isEditMode}
                    className="inline-flex items-center gap-1.5 rounded-md border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    <X className="h-3.5 w-3.5" />
                    删除
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="my-6 h-px bg-zinc-200 dark:bg-zinc-800" />

        {/* Name input */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            昵称
          </Label>
          {isEditMode ? (
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="您的昵称"
              className="border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
            />
          ) : (
            <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
              {name}
            </div>
          )}
        </div>

        {/* Email (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            邮箱地址
          </Label>
          <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400">
            {user.email}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">邮箱地址不能被更改</p>
        </div>

        {/* Background Information */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="backgroundInfo"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              背景信息
            </Label>
            {isEditMode && (
              <span
                className={`text-xs ${
                  backgroundInfo.length > MAX_BACKGROUND_LENGTH * 0.9
                    ? 'text-amber-500'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {backgroundInfo.length}/{MAX_BACKGROUND_LENGTH}
              </span>
            )}
          </div>
          {isEditMode ? (
            <Textarea
              id="backgroundInfo"
              value={backgroundInfo}
              onChange={handleBackgroundInfoChange}
              placeholder="请输入您的背景信息，这将用于AI生成更符合您需求的内容"
              className="min-h-[150px] resize-y border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
              maxLength={MAX_BACKGROUND_LENGTH}
            />
          ) : (
            <div className="min-h-[100px] rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm whitespace-pre-wrap text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100">
              {backgroundInfo || <span className="text-zinc-400">未设置背景信息</span>}
            </div>
          )}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            此信息将用于AI生成时的上下文，帮助AI更好地理解您的需求
          </p>
        </div>
      </CardContent>
      {isEditMode && (
        <CardFooter className="border-t border-zinc-200 bg-zinc-50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <Button
            onClick={handleUpdateProfile}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1.5"
          >
            {isLoading ? (
              '保存中...'
            ) : (
              <>
                <Save className="h-4 w-4" />
                保存更改
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
