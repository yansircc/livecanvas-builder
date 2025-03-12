import { Bookmark, Code, Heart, User } from 'lucide-react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type Project } from '../types'

interface ProjectModalProps {
  project: Project | null
  onClose: () => void
  hasLiked: boolean
  hasFavorited: boolean
  onLike: (projectId: string) => void
  onFavorite: (projectId: string) => void
  onCopyCode: (htmlContent: string) => void
}

export function ProjectModal({
  project,
  onClose,
  hasLiked,
  hasFavorited,
  onLike,
  onFavorite,
  onCopyCode,
}: ProjectModalProps) {
  if (!project) return null

  const thumbnailUrl =
    project.thumbnail ||
    'https://images.unsplash.com/photo-1618788372246-79faff0c3742?q=80&w=2070&auto=format&fit=crop'

  // Parse tags from comma-separated string
  const tags = project.tags
    ? project.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : []

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black"
        onClick={onClose}
      />
      <motion.div
        layoutId={`project-${project.id}`}
        className="fixed inset-4 z-50 overflow-y-auto rounded-lg bg-white p-6 md:inset-[10%] lg:inset-[15%] dark:bg-zinc-900"
      >
        <div className="flex h-full flex-col gap-6 md:flex-row md:gap-8">
          <div className="w-full md:w-1/2">
            <div className="aspect-video overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <Image
                src={thumbnailUrl}
                alt={project.title}
                width={800}
                height={600}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-bold">{project.title}</h2>
              {project.description && (
                <p className="mt-2 text-zinc-600 dark:text-zinc-300">{project.description}</p>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                    {project.user?.image ? (
                      <Image
                        src={project.user.image}
                        alt={project.user.name}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5 text-zinc-500" />
                    )}
                  </div>
                  <span className="text-sm text-zinc-600 dark:text-zinc-300">
                    {project.user?.name || 'Unknown User'}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                    onClick={() => onLike(project.id)}
                  >
                    <Heart className={`h-4 w-4 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{hasLiked ? '已点赞' : '点赞'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                    onClick={() => onFavorite(project.id)}
                  >
                    <Bookmark
                      className={`h-4 w-4 ${hasFavorited ? 'fill-yellow-500 text-yellow-500' : ''}`}
                    />
                    <span>{hasFavorited ? '已收藏' : '收藏'}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">预览</h3>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
                onClick={() => onCopyCode(project.htmlContent)}
              >
                <Code className="h-4 w-4" />
                <span>复制代码</span>
              </Button>
            </div>
            <div className="flex-1 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
              <iframe
                srcDoc={`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;}</style></head><body>${project.htmlContent}</body></html>`}
                className="h-full w-full"
                title={project.title}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={onClose}>
                关闭
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
