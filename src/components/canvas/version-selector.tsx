import { History } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/use-app-store'

export function VersionSelector() {
  const { versions, currentVersionIndex, switchToVersion } = useAppStore()

  if (versions.length <= 1) {
    return null // Only show selector when we have multiple versions
  }

  return (
    <Select
      value={currentVersionIndex.toString()}
      onValueChange={(value) => switchToVersion(Number.parseInt(value))}
    >
      <SelectTrigger className="h-8 rounded-xl border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-700 hover:bg-zinc-100 focus:ring-2 focus:ring-zinc-200 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus:ring-zinc-700">
        <div className="flex items-center gap-1.5">
          <History className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
          <SelectValue placeholder="版本历史" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {versions.map((version, index) => (
          <SelectItem key={version.id} value={index.toString()}>
            <span className="text-xs">版本 {index + 1}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
