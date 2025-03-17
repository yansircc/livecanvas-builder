'use client'

import { X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { type Project } from '@/types'

interface EditProjectDialogProps {
  project: Project
  onClose: () => void
  onSave: (project: Project) => void
}

export function EditProjectDialog({ project, onClose, onSave }: EditProjectDialogProps) {
  const [title, setTitle] = useState(project.title)
  const [description, setDescription] = useState(project.description || '')
  const [tags, setTags] = useState(project.tags || '')
  const [isPublished, setIsPublished] = useState(project.isPublished)
  const [isLoading, setIsLoading] = useState(false)

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate form
      if (!title.trim()) {
        alert('Title is required')
        return
      }

      // Create updated project object
      const updatedProject: Project = {
        ...project,
        title,
        description: description || null,
        tags: tags || null,
        isPublished,
      }

      // Call onSave callback
      onSave(updatedProject)
    } catch (error) {
      console.error('Failed to update project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="border-zinc-200 bg-white sm:max-w-[500px] dark:border-zinc-800 dark:bg-zinc-900">
        <DialogHeader className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <DialogTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            编辑项目
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              标题
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="项目标题"
              className="border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              描述
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="项目描述（可选）"
              className="border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              标签
            </Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Comma-separated tags (e.g. landing-page, portfolio, blog)"
              className="border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">用英文逗号分隔标签</p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
            <Label
              htmlFor="published"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
            >
              已发布
            </Label>
          </div>

          <DialogFooter className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? '保存中...' : '保存更改'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
