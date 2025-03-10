'use client'

interface AdviceListProps {
  advices: string[]
  onAdviceClick: (advice: string) => void
}

export function AdviceList({ advices, onAdviceClick }: AdviceListProps) {
  const handleAdviceKeyPress = (e: React.KeyboardEvent, advice: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onAdviceClick(advice)
    }
  }

  if (!advices.length) return null

  return (
    <div className="bg-card text-card-foreground rounded-lg border shadow">
      <div className="space-y-4 p-6">
        <h2 className="text-2xl font-semibold">UI Advice</h2>
        <div className="space-y-2">
          {advices.map((advice) => {
            if (!advice) return null
            return (
              <button
                key={`advice-${advice}`}
                onClick={() => onAdviceClick(advice)}
                onKeyDown={(e) => handleAdviceKeyPress(e, advice)}
                className="bg-primary/10 hover:bg-primary/20 w-full cursor-pointer rounded-md p-3 text-left transition-colors"
                type="button"
                aria-label={`Apply advice: ${advice}`}
              >
                {advice}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
