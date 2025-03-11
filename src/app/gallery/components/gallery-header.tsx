'use client'

import { Grid, List, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface GalleryHeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
}

export function GalleryHeader({
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
}: GalleryHeaderProps) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <h1 className="text-2xl font-bold">作品画廊</h1>
      <div className="flex w-full items-center gap-4 sm:w-auto">
        <div className="relative flex-1 sm:w-64 sm:flex-none">
          <Search className="absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="text"
            placeholder="搜索项目..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
