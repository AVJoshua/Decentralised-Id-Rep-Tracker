import { Link } from 'react-router-dom'
import type { DisputeRecord } from '@/hooks/useDisputeNotifications'

interface Props {
  disputes: DisputeRecord[]
  onDismiss: (subject: string, attester: string) => void
}

export default function DisputeNotificationBanner({ disputes, onDismiss }: Props) {
  if (disputes.length === 0) return null

  return (
    <div className="space-y-3">
      {disputes.map(d => (
        <div
          key={`${d.subject}-${d.attester}`}
          className="rounded-xl p-4 flex items-start gap-3"
          style={{
            backgroundColor: 'rgba(234,179,8,0.08)',
            border: '1px solid var(--color-warning)',
          }}
        >
          <span className="text-lg mt-0.5" aria-hidden>!</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: 'var(--color-warning)' }}>
              Dispute Raised Against You
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Attester:{' '}
              <span className="font-mono break-all">{d.attester}</span>
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              Raised {new Date(d.timestamp).toLocaleDateString()}
            </p>
            <Link
              to="/disputes"
              className="inline-block mt-2 text-xs font-medium underline"
              style={{ color: 'var(--color-btc)' }}
            >
              Settle this dispute
            </Link>
          </div>
          <button
            onClick={() => onDismiss(d.subject, d.attester)}
            className="shrink-0 p-1 rounded hover:opacity-70"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Dismiss notification"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
