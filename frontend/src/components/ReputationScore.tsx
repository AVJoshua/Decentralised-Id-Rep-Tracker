interface ReputationScoreProps {
  score: bigint
  reviewCount?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function ReputationScore({
  score,
  reviewCount,
  showLabel = true,
  size = 'md',
}: ReputationScoreProps) {
  const numeric = Number(score)
  const pct = Math.min(100, Math.max(0, numeric))

  const colour =
    pct >= 75 ? 'var(--color-success)' :
    pct >= 40 ? 'var(--color-btc)' :
                'var(--color-error)'

  const heights   = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }
  const textSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }

  return (
    <div className="w-full space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span style={{ color: 'var(--color-text-secondary)' }} className="text-xs uppercase tracking-wider font-medium">
            Reputation Score
          </span>
          <span className={`${textSizes[size]} font-bold font-mono`} style={{ color: colour }}>
            {numeric}
          </span>
        </div>
      )}
      <div
        className={`w-full rounded-full overflow-hidden ${heights[size]}`}
        style={{ backgroundColor: 'var(--color-surface-3)' }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: colour }}
        />
      </div>
      {reviewCount !== undefined && (
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
