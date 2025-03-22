import { Upload, User } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MAX_BACKGROUND_LENGTH } from './profile-info'

interface User {
  id: string
  name: string
  email: string
  image?: string | null
  backgroundInfo?: string | null
}

interface EditProfileDialogProps {
  isDialogOpen: boolean
  setIsDialogOpen: (isDialogOpen: boolean) => void
  user: User
  handleSubmit: (e: React.FormEvent) => void
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  isUploading: boolean
  isSubmitting: boolean
  formData: {
    name: string
    image: string
    backgroundInfo: string
  }
}

export function EditProfileDialog({
  isDialogOpen,
  setIsDialogOpen,
  user,
  handleSubmit,
  handleInputChange,
  handleAvatarUpload,
  isUploading,
  isSubmitting,
  formData,
}: EditProfileDialogProps) {
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>编辑资料</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[750px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>编辑个人资料</DialogTitle>
            <DialogDescription>更新您的个人信息和背景资料。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Name field */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                姓名
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            {/* Email field (read-only) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                邮箱
              </Label>
              <div className="col-span-3">
                <Input
                  id="email"
                  value={user.email}
                  className="bg-zinc-50 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400"
                  readOnly
                />
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">邮箱地址不能被修改</p>
              </div>
            </div>

            {/* Avatar upload */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="avatar" className="mt-2 text-right">
                头像
              </Label>
              <div className="col-span-3">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    {formData.image ? (
                      <Image src={formData.image} alt="User avatar" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-8 w-8 text-zinc-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="avatar-upload"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {isUploading ? '上传中...' : '上传头像'}
                    </Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isUploading}
                    />
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      支持JPG、PNG格式，最大5MB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Background info */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="backgroundInfo" className="mt-2 text-right">
                背景信息
              </Label>
              <div className="col-span-3">
                <div className="relative">
                  <Textarea
                    id="backgroundInfo"
                    name="backgroundInfo"
                    value={formData.backgroundInfo || ''}
                    onChange={handleInputChange}
                    className="min-h-[120px] resize-y"
                    placeholder="添加您的背景信息，以便AI更好地理解您的需求"
                    rows={10}
                    maxLength={MAX_BACKGROUND_LENGTH}
                  />
                  <div className="mt-1 flex justify-between">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      此信息将用于AI生成时的上下文，帮助AI更好地理解您的需求
                    </p>
                    <span
                      className={`text-xs ${
                        formData.backgroundInfo.length > MAX_BACKGROUND_LENGTH * 0.9
                          ? 'text-amber-500'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {formData.backgroundInfo.length}/{MAX_BACKGROUND_LENGTH}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : '保存更改'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
