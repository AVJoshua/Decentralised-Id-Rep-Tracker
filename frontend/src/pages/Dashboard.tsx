import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '@/hooks/useWallet'
import { useIdentity } from '@/hooks/useIdentity'
import { useReputation } from '@/hooks/useReputation'
import IdentityCard from '@/components/IdentityCard'
import ScoreChart, { type ScoreDataPoint } from '@/components/ScoreChart'
import Spinner from '@/components/Spinner'
import type { ProfileData } from '@/types'

export default function Dashboard() {
  const { walletAddress } = useWallet()
  const { isRegistered, getProfile, register, loading: idLoading } = useIdentity()
  const { getScore, getReviewCount, loading: repLoading }          = useReputation()
  const navigate = useNavigate()

  const [profile, setProfile]       = useState<ProfileData | null>(null)
  const [chartData, setChartData]   = useState<ScoreDataPoint[]>([])
  const [regLoading, setRegLoading] = useState(false)

  const loading = idLoading || repLoading

  useEffect(() => {
    if (walletAddress) void loadProfile()
  }, [walletAddress])

  async function loadProfile() {
    if (!walletAddress) return
    const [registered, cid, score, reviewCount] = await Promise.all([
      isRegistered(walletAddress),
      getProfile(walletAddress),
      getScore(walletAddress),
      getReviewCount(walletAddress),
    ])
    setProfile({ address: walletAddress, isRegistered: registered, cid, score, reviewCount })
    const avg = reviewCount > 0 ? Math.round(Number(score) / reviewCount) : 0
    setChartData([{ label: 'Avg Score', score: avg }])
  }

  async function handleRegister() {
    setRegLoading(true)
    try {
      await register()
      await loadProfile()
    } finally {
      setRegLoading(false)
    }
  }

  if (loading && !profile) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
        Dashboard
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          {profile ? (
            <IdentityCard
              profile={profile}
              isOwner
              onViewProfile={() => void navigate('/profile')}
            />
          ) : (
            <div
              className="rounded-xl p-6 flex items-center justify-center"
              style={{
                backgroundColor: 'var(--color-surface-1)',
                border: '1px solid var(--color-border)',
                minHeight: 180,
              }}
            >
              <Spinner />
            </div>
          )}

          {profile && !profile.isRegistered && (
            <button
              onClick={() => void handleRegister()}
              disabled={regLoading}
              className="w-full py-2.5 rounded font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-btc)', color: '#000' }}
            >
              {regLoading && <Spinner size="sm" />}
              {regLoading ? 'Registering...' : 'Register Identity'}
            </button>
          )}
        </div>

        <div
          className="lg:col-span-2 rounded-xl p-6 space-y-4"
          style={{
            backgroundColor: 'var(--color-surface-1)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h2
            className="font-semibold text-sm uppercase tracking-wider"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Reputation History
          </h2>
          <ScoreChart data={chartData} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { label: 'Attest a Peer', path: '/attest',   desc: 'Vouch for someone on OPNet' },
          { label: 'View Disputes', path: '/disputes', desc: 'Check or raise on-chain disputes' },
        ].map(({ label, path, desc }) => (
          <button
            key={path}
            onClick={() => void navigate(path)}
            className="rounded-xl p-5 text-left transition-colors"
            style={{
              backgroundColor: 'var(--color-surface-1)',
              border: '1px solid var(--color-border)',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-btc)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          >
            <p className="font-semibold" style={{ color: 'var(--color-btc)' }}>{label}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
