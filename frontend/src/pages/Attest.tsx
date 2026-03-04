import { useState } from 'react'
import AttestationForm from '@/components/AttestationForm'
import { useReputation } from '@/hooks/useReputation'
import { useWallet } from '@/hooks/useWallet'
import Spinner from '@/components/Spinner'

export default function Attest() {
  const { getScore, getReviewCount, hasAttested } = useReputation()
  const { walletAddress } = useWallet()

  const [lookupAddr, setLookupAddr]   = useState('')
  const [lookupData, setLookupData]   = useState<{ score: bigint; reviews: number; alreadyAttested: boolean } | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    if (!lookupAddr.trim() || !walletAddress) return
    setLookupLoading(true)
    try {
      const [score, reviews, alreadyAttested] = await Promise.all([
        getScore(lookupAddr.trim()),
        getReviewCount(lookupAddr.trim()),
        hasAttested(walletAddress, lookupAddr.trim()),
      ])
      setLookupData({ score, reviews, alreadyAttested })
    } finally {
      setLookupLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Attest a Peer
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Submit a reputation score for any registered DIRT identity.
        </p>
      </div>

      <div
        className="rounded-xl p-6 space-y-4"
        style={{
          backgroundColor: 'var(--color-surface-1)',
          border: '1px solid var(--color-border)',
        }}
      >
        <h2 className="font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
          Lookup Address
        </h2>
        <form onSubmit={(e) => void handleLookup(e)} className="flex gap-2">
          <input
            type="text"
            value={lookupAddr}
            onChange={e => setLookupAddr(e.target.value)}
            placeholder="bc1p..."
            className="flex-1 px-3 py-2 rounded text-sm font-mono focus:outline-none"
            style={{
              backgroundColor: 'var(--color-surface-3)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--color-btc)')}
            onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
          />
          <button
            type="submit"
            disabled={lookupLoading}
            className="px-4 py-2 rounded text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
            style={{
              backgroundColor: 'var(--color-surface-3)',
              color: 'var(--color-btc)',
              border: '1px solid var(--color-btc)',
            }}
          >
            {lookupLoading ? <Spinner size="sm" /> : 'Lookup'}
          </button>
        </form>

        {lookupData && (
          <div
            className="rounded-lg p-4 space-y-1.5 text-sm"
            style={{
              backgroundColor: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Score:{' '}
              <span className="font-mono font-bold" style={{ color: 'var(--color-btc)' }}>
                {lookupData.score.toString()}
              </span>
            </p>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Reviews: <span className="font-mono">{lookupData.reviews}</span>
            </p>
            {lookupData.alreadyAttested && (
              <p style={{ color: 'var(--color-warning)' }}>
                You have already attested to this address.
              </p>
            )}
          </div>
        )}
      </div>

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
          Submit Attestation
        </h2>
        <AttestationForm prefillAddress={lookupAddr} />
      </div>
    </div>
  )
}
