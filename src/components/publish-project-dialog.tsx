'use client'

import { X } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
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
import { createProject } from '@/server/gallery'
import { generateThumbnail } from '@/server/thumbnail'

interface PublishProjectDialogProps {
  htmlContent: string
  trigger?: React.ReactNode
  onSuccess?: () => void
  getScreenshot?: () => Promise<string | null>
  isCapturingScreenshot?: boolean
}

export function PublishProjectDialog({
  htmlContent,
  trigger,
  onSuccess,
  getScreenshot,
  isCapturingScreenshot = false,
}: PublishProjectDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag])
      setTagInput('')
    } else if (tags.length >= 5) {
      toast.error('最多添加 5 个标签')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handlePublish = async () => {
    if (!title) {
      toast.error('请输入标题')
      return
    }

    setIsLoading(true)
    try {
      let thumbnail = ''

      // Try to get screenshot if the function is provided
      if (getScreenshot) {
        try {
          const screenshot = await getScreenshot()
          if (screenshot) {
            // Use the screenshot for thumbnail generation
            thumbnail = await generateThumbnail(screenshot)
          } else {
            // Fallback to using HTML content
            thumbnail = await generateThumbnail(htmlContent)
          }
        } catch (error) {
          console.error('Screenshot capture failed:', error)
          // Fallback to using HTML content
          thumbnail = await generateThumbnail(htmlContent)
        }
      } else {
        // No screenshot function provided, use HTML content
        thumbnail = await generateThumbnail(htmlContent)
      }

      // Create the project
      await createProject({
        title,
        description,
        htmlContent,
        thumbnail,
        tags: tags.join(','), // Join tags with commas for storage
        isPublished: true,
      })

      toast.success('项目发布成功！')
      setOpen(false)

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      } else {
        // Navigate to gallery
        router.push('/gallery')
      }
    } catch (error) {
      console.error('Failed to publish project:', error)
      toast.error('发布失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" size="sm" disabled={isCapturingScreenshot || isLoading}>
            {isCapturingScreenshot ? '准备截图中...' : '发布到画廊'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>发布项目到画廊</DialogTitle>
          <DialogDescription>
            分享你的创作到 LiveCanvas 社区，让更多人看到你的作品。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              标题
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="输入项目标题"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              描述
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="简单描述一下你的项目（可选）"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="tags" className="pt-2 text-right">
              标签
            </Label>
            <div className="col-span-3 space-y-2">
              <div className="mb-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="rounded-full p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">移除</span>
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="添加标签（最多5个）"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || tags.length >= 5}
                >
                  添加
                </Button>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                按回车键添加标签，最多添加5个标签
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handlePublish}
            disabled={isLoading || isCapturingScreenshot}
          >
            {isLoading ? '发布中...' : isCapturingScreenshot ? '准备截图中...' : '发布'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
