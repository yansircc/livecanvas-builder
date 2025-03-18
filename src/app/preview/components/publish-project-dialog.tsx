'use client'

import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '@/actions/gallery'
import { generateThumbnail } from '@/actions/thumbnail'
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

interface PublishProjectDialogProps {
  htmlContent: string
  trigger?: React.ReactNode
  onSuccess?: () => void
  getScreenshot?: () => Promise<string | null>
  isCapturingScreenshot?: boolean
}

interface Metadata {
  title: string
  description: string
  tags: string[]
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
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])

  // Function to generate metadata from the API
  const generateMetadata = useCallback(
    async (regenerate = false) => {
      if (!htmlContent) {
        toast.error('HTML content is required')
        return
      }

      setIsGeneratingMetadata(true)

      try {
        const response = await fetch('/api/metadata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            htmlContent,
            regenerate,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to generate metadata')
        }

        const data = (await response.json()) as Metadata

        // Update form fields with generated metadata
        setTitle(data.title || '')
        setDescription(data.description || '')
        setTags(data.tags || [])

        // Only show success message if regenerating (not on initial load)
        if (regenerate) {
          toast.success('元数据已重新生成')
        }
      } catch (err) {
        console.error('Failed to generate metadata:', err)
        toast.error('生成元数据失败: ' + (err instanceof Error ? err.message : '未知错误'))
      } finally {
        setIsGeneratingMetadata(false)
      }
    },
    [htmlContent],
  )

  // Fetch metadata when dialog opens
  useEffect(() => {
    if (open && htmlContent && !title && !description && tags.length === 0) {
      void generateMetadata()
    }
  }, [open, htmlContent, title, description, tags.length, generateMetadata])

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
          <Button variant="outline" size="sm" disabled={isCapturingScreenshot || isLoading}>
            {isCapturingScreenshot ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="sr-only md:not-sr-only">Preparing Screenshot...</span>
              </>
            ) : (
              <span className="sr-only md:not-sr-only">Publish</span>
            )}
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
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <div className="relative">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={isGeneratingMetadata ? 'pr-10' : ''}
                placeholder={isGeneratingMetadata ? '生成中...' : '输入项目标题'}
                disabled={isGeneratingMetadata}
              />
              {isGeneratingMetadata && (
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
                  <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <div className="relative">
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={isGeneratingMetadata ? 'pr-10' : ''}
                placeholder={isGeneratingMetadata ? '生成中...' : '简单描述一下你的项目'}
                disabled={isGeneratingMetadata}
                rows={3}
              />
              {isGeneratingMetadata && (
                <div className="absolute top-6 right-3">
                  <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              {isGeneratingMetadata ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" /> 正在生成标签...
                </span>
              ) : tags.length > 0 ? (
                <>标签: {tags.join(', ')}</>
              ) : (
                '标签将自动生成'
              )}
            </p>
          </div>

          {/* Regenerate Button */}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => generateMetadata(true)}
              disabled={isGeneratingMetadata || isLoading}
              className="h-8 px-3 text-xs"
            >
              {isGeneratingMetadata ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" /> 重新生成
                </>
              ) : (
                '重新生成元数据'
              )}
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handlePublish}
            disabled={isLoading || isCapturingScreenshot || isGeneratingMetadata}
          >
            {isLoading
              ? '发布中...'
              : isCapturingScreenshot
                ? '准备截图中...'
                : isGeneratingMetadata
                  ? '生成元数据中...'
                  : '发布'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
