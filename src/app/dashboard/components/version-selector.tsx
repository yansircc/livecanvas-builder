import { History } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/use-app-store'

interface VersionSelectorProps {
  taskId?: string | null
}

export function VersionSelector({ taskId }: VersionSelectorProps = {}) {
  const { versions, currentVersionIndex, switchToVersion } = useAppStore()

  // Filter versions to only show those for the current task
  const taskVersions = taskId ? versions.filter((version) => version.taskId === taskId) : versions

  // Only show selector when we have multiple versions for the current task
  if (taskVersions.length <= 1) {
    return null
  }

  // Find global version indices for the filtered versions
  const taskVersionIndices = taskVersions.map((v) =>
    versions.findIndex((version) => version.id === v.id),
  )

  // Make sure current version is in the task versions, otherwise use the first task version
  const selectedVersionIndex = taskVersionIndices.includes(currentVersionIndex)
    ? taskVersionIndices.indexOf(currentVersionIndex)
    : 0

  return (
    <Select
      value={selectedVersionIndex.toString()}
      onValueChange={(value) => {
        const globalIndex = taskVersionIndices[Number.parseInt(value)]
        if (globalIndex !== undefined) {
          switchToVersion(globalIndex)
        }
      }}
    >
      <SelectTrigger className="h-8 rounded-xl border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-700 hover:bg-zinc-100 focus:ring-2 focus:ring-zinc-200 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus:ring-zinc-700">
        <div className="flex items-center gap-1.5">
          <History className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
          <SelectValue placeholder="版本历史" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {taskVersions.map((version, index) => (
          <SelectItem key={version.id} value={index.toString()}>
            <span className="text-xs">版本 {index + 1}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
