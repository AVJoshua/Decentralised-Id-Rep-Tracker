import Badge from './Badge'
import ReputationScore from './ReputationScore'
import type { ProfileData } from '@/types'

interface IdentityCardProps {
  profile: ProfileData
  isOwner?: boolean
  onViewProfile?: () => void
}

function truncate(addr: string) {
  return addr.length > 12 ? `${addr.slice(0, 8)}...${addr.slice(-6)}` : addr
}

export default function IdentityCard({ profile, isOwner, onViewProfile }: IdentityCardProps) {
  return (
    <article
      className="rounded-xl p-6 space-y-4"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p
            className="font-mono text-sm truncate"
            style={{ color: 'var(--color-text-secondary)' }}
            title={profile.address}
          >
            {truncate(profile.address)}
          </p>
          {isOwner && (
            <p className="text-xs" style={{ color: 'var(--color-btc)' }}>You</p>
          )}
        </div>
        <Badge variant={profile.isRegistered ? 'registered' : 'unregistered'} />
      </div>

      {profile.cid && (
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
            IPFS Profile
          </p>
          <a
            href={`https://ipfs.io/ipfs/${profile.cid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs break-all"
            style={{ color: 'var(--color-btc)' }}
          >
            {profile.cid.slice(0, 20)}...
          </a>
        </div>
      )}

      <ReputationScore
        score={profile.reviewCount > 0
          ? BigInt(Math.round(Number(profile.score) / profile.reviewCount))
          : 0n}
        reviewCount={profile.reviewCount}
        size="sm"
      />

      {onViewProfile && (
        <button
          onClick={onViewProfile}
          className="w-full py-2 rounded text-sm font-medium transition-colors hover:border-[var(--color-btc)] hover:text-[var(--color-btc)]"
          style={{
            backgroundColor: 'var(--color-surface-3)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          View Full Profile
        </button>
      )}
    </article>
  )
}
