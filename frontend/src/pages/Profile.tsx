import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useWallet } from '@/hooks/useWallet'
import { useIdentity } from '@/hooks/useIdentity'
import { useReputation } from '@/hooks/useReputation'
import IdentityCard from '@/components/IdentityCard'
import AttestationForm from '@/components/AttestationForm'
import DisputeForm from '@/components/DisputeForm'
import EditProfileForm from '@/components/EditProfileForm'
import ScoreChart, { type ScoreDataPoint } from '@/components/ScoreChart'
import Spinner from '@/components/Spinner'
import type { ProfileData } from '@/types'

export default function Profile() {
  const { address: paramAddress } = useParams<{ address?: string }>()
  const { walletAddress } = useWallet()
  const { isRegistered, getProfile } = useIdentity()
  const { getScore, getReviewCount } = useReputation()

  const targetAddress = paramAddress ?? walletAddress ?? ''
  const isOwner = targetAddress.toLowerCase() === (walletAddress?.toLowerCase() ?? '')

  const [profile, setProfile]     = useState<ProfileData | null>(null)
  const [loading, setLoading]     = useState(true)
  const [chartData, setChartData] = useState<ScoreDataPoint[]>([])
  const [tab, setTab]             = useState<'attest' | 'dispute'>('attest')

  useEffect(() => {
    if (!targetAddress) return
    setLoading(true)
    void Promise.all([
      isRegistered(targetAddress),
      getProfile(targetAddress),
      getScore(targetAddress),
      getReviewCount(targetAddress),
    ]).then(([registered, cid, score, reviewCount]) => {
      setProfile({ address: targetAddress, isRegistered: registered, cid, score, reviewCount })
      const avg = reviewCount > 0 ? Math.round(Number(score) / reviewCount) : 0
      setChartData([{ label: 'Avg Score', score: avg }])
    }).finally(() => setLoading(false))
  }, [targetAddress])

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  }

  if (!profile) return null

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
        {isOwner ? 'My Profile' : 'Profile'}
      </h1>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <IdentityCard profile={profile} isOwner={isOwner} />
        </div>
        <div
          className="lg:col-span-3 rounded-xl p-6 space-y-4"
          style={{
            backgroundColor: 'var(--color-surface-1)',
            border: '1px solid var(--color-border)',
          }}
        >
          <h2 className="font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
            Score History
          </h2>
          <ScoreChart data={chartData} />
        </div>
      </div>

      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: 'var(--color-surface-1)',
          border: '1px solid var(--color-border)',
        }}
      >
        {isOwner ? (
          <>
            <h2
              className="font-semibold text-sm uppercase tracking-wider mb-5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Edit Profile
            </h2>
            <EditProfileForm
              currentCid={profile.cid}
              onSuccess={cid => setProfile(prev => prev ? { ...prev, cid } : prev)}
            />
          </>
        ) : (
          <>
            <div
              className="flex gap-1 mb-6 p-1 rounded-lg"
              style={{ backgroundColor: 'var(--color-surface-3)' }}
            >
              {(['attest', 'dispute'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 py-1.5 rounded text-sm font-medium capitalize transition-colors"
                  style={{
                    backgroundColor: tab === t ? 'var(--color-surface-1)' : 'transparent',
                    color: tab === t ? 'var(--color-btc)' : 'var(--color-text-secondary)',
                    border: tab === t ? '1px solid var(--color-border)' : '1px solid transparent',
                  }}
                >
                  {t === 'attest' ? 'Attest' : 'Raise Dispute'}
                </button>
              ))}
            </div>

            {tab === 'attest'
              ? <AttestationForm prefillAddress={targetAddress} />
              : <DisputeForm prefillSubject={targetAddress} />
            }
          </>
        )}
      </div>
    </div>
  )
}
