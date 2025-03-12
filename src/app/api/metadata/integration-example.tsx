'use client'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Metadata {
  title: string
  description: string
  tags: string[]
}

export function MetadataGenerator({ htmlContent }: { htmlContent: string }) {
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Function to generate metadata
  const generateMetadata = async (regenerate = false) => {
    if (!htmlContent) {
      setError('HTML content is required')
      return
    }

    setIsLoading(true)
    setError(null)

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

      const data = await response.json()
      setMetadata(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">Project Metadata</h3>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateMetadata(false)}
            disabled={isLoading}
          >
            {isLoading && !metadata ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generate Metadata
          </Button>
          {metadata && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateMetadata(true)}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Regenerate
            </Button>
          )}
        </div>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input
            value={metadata?.title || ''}
            onChange={(e) => setMetadata({ ...metadata!, title: e.target.value })}
            placeholder={isLoading ? 'Generating title...' : 'Project title'}
            disabled={isLoading || !metadata}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            value={metadata?.description || ''}
            onChange={(e) => setMetadata({ ...metadata!, description: e.target.value })}
            placeholder={isLoading ? 'Generating description...' : 'Project description'}
            disabled={isLoading || !metadata}
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Tags</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {metadata?.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
            {!metadata?.tags.length && !isLoading && (
              <span className="text-sm text-gray-500">No tags generated yet</span>
            )}
            {isLoading && !metadata && (
              <span className="text-sm text-gray-500">Generating tags...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
