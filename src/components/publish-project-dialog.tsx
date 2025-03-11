'use client'

import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
}

export function PublishProjectDialog({
  htmlContent,
  trigger,
  onSuccess,
}: PublishProjectDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handlePublish = async () => {
    if (!title) {
      toast.error('请输入标题')
      return
    }

    setIsLoading(true)

    try {
      // Generate a thumbnail from the HTML content
      let thumbnail = ''
      try {
        thumbnail = await generateThumbnail(htmlContent)
      } catch (error) {
        console.error('Failed to generate thumbnail:', error)
        // Continue with a default thumbnail
        thumbnail =
          'https://images.unsplash.com/photo-1618788372246-79faff0c3742?q=80&w=2070&auto=format&fit=crop'
      }

      const result = await createProject({
        title,
        description,
        htmlContent,
        thumbnail,
        isPublished: true,
      })

      if (result.success) {
        toast.success('发布成功', {
          description: '您的项目已成功发布到画廊',
        })
        setOpen(false)

        if (onSuccess) {
          onSuccess()
        }

        // Redirect to gallery
        router.push('/gallery')
      } else {
        toast.error('发布失败', {
          description: result.error || '发布项目时出错',
        })
      }
    } catch (error) {
      console.error('Failed to publish project:', error)
      toast.error('发布失败', {
        description: '发布项目时出错',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">发布到画廊</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>发布项目到画廊</DialogTitle>
          <DialogDescription>填写项目信息，将您的作品分享给社区</DialogDescription>
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
              required
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
              placeholder="输入项目描述（可选）"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handlePublish} disabled={isLoading}>
            {isLoading ? '发布中...' : '发布'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
