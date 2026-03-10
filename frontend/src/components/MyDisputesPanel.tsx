import { useState } from 'react'
import { useDispute } from '@/hooks/useDispute'
import { useWallet } from '@/hooks/useWallet'
import { useDisputeNotifications } from '@/hooks/useDisputeNotifications'
import type { DisputeRecord } from '@/hooks/useDisputeNotifications'
import Badge from './Badge'
import Spinner from './Spinner'

function DisputeRow({
  dispute,
  onSettle,
  settling,
}: {
  dispute: DisputeRecord
  onSettle: (attester: string, outcome: 'accepted' | 'dismissed') => Promise<void>
  settling: string | null
}) {
  const isBusy = settling === dispute.attester

  return (
    <div
      className="rounded-lg p-4 space-y-3"
      style={{
        backgroundColor: 'var(--color-surface-3)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Attester</p>
          <p className="text-sm font-mono break-all" style={{ color: 'var(--color-text-primary)' }}>
            {dispute.attester}
          </p>
        </div>
        <Badge variant="pending" />
      </div>

      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
        <span>Raised by: <span className="font-mono">{dispute.raiser.slice(0, 12)}...{dispute.raiser.slice(-6)}</span></span>
        <span>|</span>
        <span>{new Date(dispute.timestamp).toLocaleDateString()}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => void onSettle(dispute.attester, 'accepted')}
          disabled={!!settling}
          className="py-2 rounded font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-success)', color: '#fff' }}
        >
          {isBusy && <Spinner size="sm" />}
          Accept
        </button>
        <button
          type="button"
          onClick={() => void onSettle(dispute.attester, 'dismissed')}
          disabled={!!settling}
          className="py-2 rounded font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-error)', color: '#fff' }}
        >
          {isBusy && <Spinner size="sm" />}
          Dismiss
        </button>
      </div>
    </div>
  )
}

export default function MyDisputesPanel() {
  const { walletAddress } = useWallet()
  const { resolveDispute, error } = useDispute()
  const { pendingAgainstMe, markSettled, myCounts } = useDisputeNotifications(walletAddress)

  const [settling, setSettling] = useState<string | null>(null)
  const [txMsg, setTxMsg]       = useState('')
  const [settleError, setSettleError] = useState<string | null>(null)

  async function handleSettle(attester: string, outcome: 'accepted' | 'dismissed') {
    if (!walletAddress) return
    setSettling(attester)
    setTxMsg('')
    setSettleError(null)
    try {
      const chainOutcome = outcome === 'accepted' ? 2n : 3n
      const ok = await resolveDispute(walletAddress, attester, chainOutcome)
      if (ok) {
        markSettled(walletAddress, attester, outcome)
        setTxMsg(`Dispute ${outcome} successfully.`)
      }
    } catch (e) {
      const msg = String(e)
      if (msg.includes('Method not found')) {
        setSettleError('The deployed contract does not support dispute settlement yet.')
      } else {
        setSettleError(msg)
      }
    } finally {
      setSettling(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      {myCounts.total > 0 && (
        <div
          className="flex gap-4 p-3 rounded-lg text-xs"
          style={{ backgroundColor: 'var(--color-surface-3)' }}
        >
          <span style={{ color: 'var(--color-warning)' }}>
            Pending: <strong>{myCounts.pending}</strong>
          </span>
          <span style={{ color: 'var(--color-success)' }}>
            Accepted: <strong>{myCounts.accepted}</strong>
          </span>
          <span style={{ color: 'var(--color-error)' }}>
            Dismissed: <strong>{myCounts.dismissed}</strong>
          </span>
        </div>
      )}

      {/* Pending disputes list */}
      {pendingAgainstMe.length === 0 ? (
        <p className="text-sm py-4 text-center" style={{ color: 'var(--color-text-muted)' }}>
          No pending disputes against you.
        </p>
      ) : (
        <div className="space-y-3">
          {pendingAgainstMe.map(d => (
            <DisputeRow
              key={`${d.subject}-${d.attester}`}
              dispute={d}
              onSettle={handleSettle}
              settling={settling}
            />
          ))}
        </div>
      )}

      {(error || settleError) && (
        <p className="text-sm" style={{ color: 'var(--color-error)' }}>
          Error: {settleError ?? error}
        </p>
      )}
      {txMsg && <p className="text-sm" style={{ color: 'var(--color-success)' }}>{txMsg}</p>}
    </div>
  )
}
