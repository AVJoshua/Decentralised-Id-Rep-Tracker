import { useState } from 'react'
import { useIdentity } from '@/hooks/useIdentity'
import Spinner from './Spinner'

interface EditProfileFormProps {
  currentCid?: string
  onSuccess?: (cid: string) => void
}

export default function EditProfileForm({ currentCid = '', onSuccess }: EditProfileFormProps) {
  const { setProfile, loading, error } = useIdentity()
  const [cid, setCid]   = useState(currentCid)
  const [txMsg, setTxMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cid.trim()) return
    setTxMsg('')
    const ok = await setProfile(cid.trim())
    if (ok) {
      setTxMsg('Profile updated on-chain.')
      onSuccess?.(cid.trim())
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="ipfs-cid"
          className="text-sm font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          IPFS CID
        </label>
        <input
          id="ipfs-cid"
          type="text"
          value={cid}
          onChange={e => setCid(e.target.value)}
          placeholder="QmYwAPJzv5CZsnAzt8auV39s... or bafybeig..."
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
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Upload a JSON metadata file to IPFS and paste the CID here (max 64 bytes UTF-8).
        </p>
      </div>

      {error  && <p className="text-sm" style={{ color: 'var(--color-error)' }}>Error: {error}</p>}
      {txMsg  && <p className="text-sm" style={{ color: 'var(--color-success)' }}>{txMsg}</p>}

      <button
        type="submit"
        disabled={loading || !cid.trim()}
        className="w-full py-2.5 rounded font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ backgroundColor: 'var(--color-btc)', color: '#000' }}
      >
        {loading && <Spinner size="sm" />}
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  )
}
