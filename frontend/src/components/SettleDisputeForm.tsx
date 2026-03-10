import { useState, useEffect } from 'react'
import { useDispute } from '@/hooks/useDispute'
import { useWallet } from '@/hooks/useWallet'
import Badge from './Badge'
import Spinner from './Spinner'

interface Props {
  prefillAttester?: string
  onSettled?: (attester: string) => void
}

export default function SettleDisputeForm({ prefillAttester = '', onSettled }: Props) {
  const { walletAddress } = useWallet()
  const { resolveDispute, getDisputeStatus, loading, error } = useDispute()

  const [attester, setAttester]       = useState(prefillAttester)
  const [status, setStatus]           = useState<string | null>(null)
  const [txMsg, setTxMsg]             = useState('')
  const [settleError, setSettleError] = useState<string | null>(null)
  const [checking, setChecking]       = useState(false)

  useEffect(() => { setAttester(prefillAttester) }, [prefillAttester])

  async function handleCheck() {
    if (!walletAddress || !attester.trim()) return
    setChecking(true)
    setStatus(null)
    setTxMsg('')
    try {
      const s = await getDisputeStatus(walletAddress, attester.trim())
      setStatus(s)
    } finally {
      setChecking(false)
    }
  }

  async function handleSettle(outcome: bigint) {
    if (!walletAddress || !attester.trim()) return
    setTxMsg('')
    setSettleError(null)
    try {
      const ok = await resolveDispute(walletAddress, attester.trim(), outcome)
      if (ok) {
        const label = outcome === 2n ? 'accepted' : 'dismissed'
        setTxMsg(`Dispute ${label} successfully.`)
        setStatus(outcome === 2n ? 'resolved' : 'rejected')
        onSettled?.(attester.trim())
      }
    } catch (e) {
      const msg = String(e)
      if (msg.includes('Method not found')) {
        setSettleError('The deployed contract does not support dispute settlement yet. It needs to be redeployed with the updated WASM.')
      } else {
        setSettleError(msg)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="settle-attester"
          className="text-sm font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Attester Address
        </label>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Enter the attester address from the dispute raised against you.
        </p>
        <input
          id="settle-attester"
          type="text"
          value={attester}
          onChange={e => { setAttester(e.target.value); setStatus(null); setTxMsg('') }}
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

      <button
        type="button"
        onClick={() => void handleCheck()}
        disabled={checking || !attester.trim()}
        className="w-full py-2 rounded text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        style={{
          backgroundColor: 'var(--color-surface-3)',
          color: 'var(--color-btc)',
          border: '1px solid var(--color-btc)',
        }}
      >
        {checking ? <Spinner size="sm" /> : 'Check My Dispute'}
      </button>

      {status !== null && (
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Status:
          </span>
          <Badge variant={status === 'none' ? 'none' : status as 'pending' | 'resolved' | 'rejected'} />
        </div>
      )}

      {status === 'pending' && (
        <div className="space-y-3 pt-2">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            This dispute is pending. As the subject, you can settle it:
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => void handleSettle(2n)}
              disabled={loading}
              className="py-2.5 rounded font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-success)', color: '#fff' }}
            >
              {loading && <Spinner size="sm" />}
              Accept Dispute
            </button>
            <button
              type="button"
              onClick={() => void handleSettle(3n)}
              disabled={loading}
              className="py-2.5 rounded font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-error)', color: '#fff' }}
            >
              {loading && <Spinner size="sm" />}
              Dismiss Dispute
            </button>
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <strong>Accept:</strong> Acknowledge the dispute and mark it as resolved.{' '}
            <strong>Dismiss:</strong> Reject the dispute claim.
          </p>
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
