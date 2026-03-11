import { useState, useEffect } from 'react'
import { useDispute } from '@/hooks/useDispute'
import { useWallet } from '@/hooks/useWallet'
import { useDisputeNotifications } from '@/hooks/useDisputeNotifications'
import Spinner from './Spinner'

interface DisputeFormProps {
  prefillSubject?: string
  prefillAttester?: string
  onSuccess?: () => void
}

export default function DisputeForm({
  prefillSubject = '',
  prefillAttester = '',
  onSuccess,
}: DisputeFormProps) {
  const { raiseDispute, loading, error } = useDispute()
  const { walletAddress } = useWallet()
  const { addDispute } = useDisputeNotifications(walletAddress)

  const [subject, setSubject]   = useState(prefillSubject)
  const [attester, setAttester] = useState(prefillAttester)
  const [reason, setReason]     = useState('')
  const [txMsg, setTxMsg]       = useState('')

  useEffect(() => { setSubject(prefillSubject) },   [prefillSubject])
  useEffect(() => { setAttester(prefillAttester) }, [prefillAttester])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !attester.trim()) return
    setTxMsg('')
    const ok = await raiseDispute(subject.trim(), attester.trim())
    if (ok) {
      // Record the dispute so the subject gets a notification
      addDispute({
        subject: subject.trim(),
        attester: attester.trim(),
        raiser: walletAddress ?? '',
        reason: reason.trim() || undefined,
      })
      setTxMsg('Dispute raised successfully! The subject will be notified to settle.')
      setReason('')
      onSuccess?.()
    }
  }

  const inputStyle = {
    backgroundColor: 'var(--color-surface-3)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
  }

  const fields = [
    { id: 'dispute-subject',  label: 'Subject Address',  value: subject,  set: setSubject,  hint: 'The address whose reputation score is being disputed' },
    { id: 'dispute-attester', label: 'Attester Address', value: attester, set: setAttester, hint: 'The address that submitted the disputed attestation' },
  ]

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
      {fields.map(({ id, label, value, set, hint }) => (
        <div key={id} className="space-y-1.5">
          <label htmlFor={id} className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {label}
          </label>
          <input
            id={id}
            type="text"
            value={value}
            onChange={e => set(e.target.value)}
            placeholder="opt1p... or bc1p..."
            required
            className="w-full px-3 py-2 rounded text-sm font-mono focus:outline-none"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'var(--color-btc)')}
            onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
          />
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{hint}</p>
        </div>
      ))}

      <div className="space-y-1.5">
        <label htmlFor="dispute-reason" className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          Reason <span className="font-normal" style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
        </label>
        <textarea
          id="dispute-reason"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Briefly describe why you are disputing this attestation..."
          maxLength={280}
          rows={3}
          className="w-full px-3 py-2 rounded text-sm focus:outline-none resize-none"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'var(--color-btc)')}
          onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
        />
        <p className="text-xs text-right" style={{ color: 'var(--color-text-muted)' }}>
          {reason.length}/280
        </p>
      </div>

      {error && <p className="text-sm" style={{ color: 'var(--color-error)' }}>Error: {error}</p>}
      {txMsg && <p className="text-sm" style={{ color: 'var(--color-success)' }}>{txMsg}</p>}

      <button
        type="submit"
        disabled={loading || !subject.trim() || !attester.trim()}
        className="w-full py-2.5 rounded font-medium text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
        style={{ backgroundColor: 'var(--color-error)', color: '#fff' }}
      >
        {loading && <Spinner size="sm" />}
        {loading ? 'Raising Dispute...' : 'Raise Dispute'}
      </button>
    </form>
  )
}
