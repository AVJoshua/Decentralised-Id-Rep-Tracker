import { useState, useEffect } from 'react'
import { useReputation } from '@/hooks/useReputation'
import { useWallet } from '@/hooks/useWallet'
import Spinner from './Spinner'
import { APP_CONFIG } from '@/config'

interface AttestationFormProps {
  prefillAddress?: string
  onSuccess?: () => void
}

export default function AttestationForm({ prefillAddress = '', onSuccess }: AttestationFormProps) {
  const { attest, loading, error } = useReputation()
  const { walletAddress } = useWallet()

  const [subject, setSubject] = useState(prefillAddress)
  const [score, setScore]     = useState(50)

  useEffect(() => { setSubject(prefillAddress) }, [prefillAddress])
  const [txMsg, setTxMsg]     = useState('')

  const isSelf = subject.trim().toLowerCase() === walletAddress?.toLowerCase()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || isSelf) return
    setTxMsg('')
    const ok = await attest(subject.trim(), score)
    if (ok) {
      setTxMsg('Attestation submitted successfully.')
      onSuccess?.()
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="subject-addr" className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Subject Address (bc1p...)
        </label>
        <input
          id="subject-addr"
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="bc1p..."
          required
          className="w-full px-3 py-2 rounded text-sm font-mono focus:outline-none"
          style={{
            backgroundColor: 'var(--color-surface-3)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--color-btc)')}
          onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
        />
        {isSelf && (
          <p className="text-xs" style={{ color: 'var(--color-error)' }}>
            You cannot attest to yourself.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label htmlFor="score-slider" className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Score
          </label>
          <span className="text-lg font-bold font-mono" style={{ color: 'var(--color-btc)' }}>
            {score}
          </span>
        </div>
        <input
          id="score-slider"
          type="range"
          min={APP_CONFIG.minAttestationScore}
          max={APP_CONFIG.maxAttestationScore}
          value={score}
          onChange={e => setScore(Number(e.target.value))}
          className="w-full accent-[#f7931a]"
        />
        <div className="flex justify-between text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <span>{APP_CONFIG.minAttestationScore} (Poor)</span>
          <span>{APP_CONFIG.maxAttestationScore} (Excellent)</span>
        </div>
      </div>

      {error && <p className="text-sm" style={{ color: 'var(--color-error)' }}>Error: {error}</p>}
      {txMsg && <p className="text-sm" style={{ color: 'var(--color-success)' }}>{txMsg}</p>}

      <button
        type="submit"
        disabled={loading || isSelf || !subject.trim()}
        className="w-full py-2.5 rounded font-medium text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
        style={{ backgroundColor: 'var(--color-btc)', color: '#000' }}
      >
        {loading && <Spinner size="sm" />}
        {loading ? 'Submitting...' : 'Submit Attestation'}
      </button>
    </form>
  )
}
