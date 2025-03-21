'use client'

import { Loader2 } from 'lucide-react'
import type { Control } from 'react-hook-form'
import { useController } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import type { ModelId } from '@/lib/models'

interface PromptInputProps {
  control: Control<{
    model: ModelId
    message: string
  }>
  isLoading?: boolean
  advices?: string[]
  onAdviceClick?: (advice: string) => void
}

export function PromptInput({ control, isLoading, advices = [], onAdviceClick }: PromptInputProps) {
  const { field } = useController({
    name: 'message',
    control,
  })

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="message">Prompt</Label>
        <div className="relative">
          <textarea
            id="message"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed"
            placeholder="Enter your prompt for code generation..."
            disabled={isLoading}
            {...field}
          />
          {isLoading && (
            <div className="absolute top-3 right-3">
              <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            </div>
          )}
        </div>
      </div>

      {advices.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Suggestions:</h3>
          <div className="flex flex-wrap gap-2">
            {advices.map((advice) => (
              <Badge
                key={advice}
                variant="outline"
                className="hover:bg-secondary cursor-pointer"
                onClick={() => onAdviceClick?.(advice)}
              >
                {advice}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
