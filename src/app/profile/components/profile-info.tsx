'use client'

import { toast } from 'sonner'
import { useState } from 'react'
import { updateUserProfile } from '@/actions/user'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { uploadToBunnyCDN } from '@/lib/bunny'
import { EditProfileDialog } from './edit-profile-dialog'

// Maximum character length for background info
export const MAX_BACKGROUND_LENGTH = 3000

interface User {
  id: string
  name: string
  email: string
  image?: string | null
  backgroundInfo?: string | null
}

interface ProfileInfoProps {
  user: User
}

export function ProfileInfo({ user }: ProfileInfoProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || '',
    image: user.image || '',
    backgroundInfo: user.backgroundInfo || '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Apply character limit to background info
    if (name === 'backgroundInfo' && value.length > MAX_BACKGROUND_LENGTH) {
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

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
        reader.onerror = () => reject(new Error('Failed to read file'))
      })

      // Upload to BunnyCDN
      const imageUrl = await uploadToBunnyCDN(base64)
      setFormData((prev) => ({ ...prev, image: imageUrl }))
      toast.success('头像上传成功')
    } catch (error) {
      console.error('头像上传失败:', error)
      toast.error('头像上传失败')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await updateUserProfile({
        name: formData.name,
        image: formData.image || null,
        backgroundInfo: formData.backgroundInfo || null,
      })

      if (result.success) {
        toast.success('个人资料已更新')
        setIsDialogOpen(false)
        // Use window.location to refresh the page with the updated data
        window.location.reload()
      } else {
        toast.error(result.error || '更新失败')
      }
    } catch (error) {
      console.error('更新个人资料失败:', error)
      toast.error('更新个人资料失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>个人信息</CardTitle>
          <CardDescription>查看和管理您的个人信息</CardDescription>
        </div>
        <EditProfileDialog
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          user={user}
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
          handleAvatarUpload={handleAvatarUpload}
          isUploading={isUploading}
          isSubmitting={isSubmitting}
          formData={formData}
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">基本信息</h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">姓名</p>
                <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{user.name}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 bg-zinc-100 p-4 dark:border-zinc-800">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">电子邮件（暂不支持修改）</p>
                <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{user.email}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">背景信息</h3>
            <div className="mt-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              {user.backgroundInfo ? (
                <p className="font-mono whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">
                  {user.backgroundInfo}
                </p>
              ) : (
                <p className="text-zinc-500 dark:text-zinc-400">
                  尚未添加背景信息。点击&quot;编辑资料&quot;按钮添加您的背景信息，以便AI更好地理解您的需求。
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
