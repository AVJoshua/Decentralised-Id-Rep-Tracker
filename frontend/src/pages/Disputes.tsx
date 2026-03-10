import { useState } from 'react'
import DisputeForm from '@/components/DisputeForm'
import MyDisputesPanel from '@/components/MyDisputesPanel'
import { useDispute } from '@/hooks/useDispute'
import { useWallet } from '@/hooks/useWallet'
import { useDisputeNotifications } from '@/hooks/useDisputeNotifications'
import Badge from '@/components/Badge'
import Spinner from '@/components/Spinner'
import type { DisputeStatus } from '@/types'

export default function Disputes() {
  const { getDisputeStatus } = useDispute()
  const { walletAddress } = useWallet()
  const { pendingAgainstMe } = useDisputeNotifications(walletAddress)

  const [subject, setSubject]         = useState('')
  const [attester, setAttester]       = useState('')
  const [status, setStatus]           = useState<DisputeStatus | null>(null)
  const [checkLoading, setCheckLoading] = useState(false)

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !attester.trim()) return
    setCheckLoading(true)
    try {
      const s = await getDisputeStatus(subject.trim(), attester.trim())
      setStatus(s)
    } finally {
      setCheckLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Disputes
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Manage disputes against you, check status, or raise a new one.
        </p>
      </div>

      {/* My Disputes — auto-populated, no manual lookup */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: 'var(--color-surface-1)',
          border: pendingAgainstMe.length > 0
            ? '1px solid var(--color-warning)'
            : '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-semibold text-sm uppercase tracking-wider"
            style={{ color: pendingAgainstMe.length > 0 ? 'var(--color-warning)' : 'var(--color-text-secondary)' }}
          >
            My Disputes
          </h2>
          {pendingAgainstMe.length > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ backgroundColor: 'var(--color-warning)', color: '#000' }}
            >
              {pendingAgainstMe.length}
            </span>
          )}
        </div>
        <MyDisputesPanel />
      </div>

      {/* Check dispute status */}
      <div
        className="rounded-xl p-6 space-y-4"
        style={{
          backgroundColor: 'var(--color-surface-1)',
          border: '1px solid var(--color-border)',
        }}
      >
        <h2 className="font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
          Check Dispute Status
        </h2>
        <form onSubmit={(e) => void handleCheck(e)} className="space-y-3">
          {[
            { id: 'check-subject',  label: 'Subject Address',  val: subject,  set: setSubject },
            { id: 'check-attester', label: 'Attester Address', val: attester, set: setAttester },
          ].map(({ id, label, val, set }) => (
            <div key={id} className="space-y-1">
              <label htmlFor={id} className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {label}
              </label>
              <input
                id={id}
                type="text"
                value={val}
                onChange={e => set(e.target.value)}
                placeholder="opt1p... or bc1p..."
                className="w-full px-3 py-2 rounded text-sm font-mono focus:outline-none"
                style={{
                  backgroundColor: 'var(--color-surface-3)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--color-btc)')}
                onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={checkLoading}
            className="w-full py-2 rounded text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            style={{
              backgroundColor: 'var(--color-surface-3)',
              color: 'var(--color-btc)',
              border: '1px solid var(--color-btc)',
            }}
          >
            {checkLoading ? <Spinner size="sm" /> : 'Check Status'}
          </button>
        </form>

        {status !== null && (
          <div className="flex items-center gap-3 pt-2">
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Status:</span>
            <Badge variant={status === 'none' ? 'none' : status} />
          </div>
        )}
      </div>

      {/* Raise a new dispute */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: 'var(--color-surface-1)',
          border: '1px solid var(--color-border)',
        }}
      >
        <h2
          className="font-semibold text-sm uppercase tracking-wider mb-5"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Raise a New Dispute
        </h2>
        <DisputeForm prefillSubject={subject} prefillAttester={attester} />
      </div>
    </div>
  )
}
