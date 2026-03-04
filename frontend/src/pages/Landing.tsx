import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '@/hooks/useWallet'
import WalletButton from '@/components/WalletButton'
import { APP_CONFIG } from '@/config'

const FEATURES = [
  {
    icon: '🪪',
    title: 'Self-Sovereign Identity',
    body: 'Register your Bitcoin address on-chain. You own your identity — no custodians.',
  },
  {
    icon: '⭐',
    title: 'Trustless Reputation',
    body: 'Peers attest to your score directly on OPNet. No centralized database.',
  },
  {
    icon: '⚖️',
    title: 'Dispute Resolution',
    body: 'Challenge unfair attestations. On-chain governance ensures fairness.',
  },
]

export default function Landing() {
  const { isConnected } = useWallet()
  const navigate = useNavigate()

  useEffect(() => {
    if (isConnected) void navigate('/dashboard')
  }, [isConnected, navigate])

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-16 px-4">
      <div className="text-center space-y-6 max-w-2xl">
        <div className="flex items-center justify-center gap-3">
          <span className="text-5xl" style={{ color: 'var(--color-btc)' }}>⬡</span>
          <h1 className="text-5xl font-extrabold tracking-tight" style={{ color: 'var(--color-btc)' }}>
            {APP_CONFIG.name}
          </h1>
        </div>

        <p className="text-xl font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {APP_CONFIG.fullName}
        </p>

        <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          Bitcoin-native identity and reputation — powered by{' '}
          <span style={{ color: 'var(--color-btc)' }}>OPNet</span> smart contracts
          on Bitcoin L1. No bridges. No trust. Just code.
        </p>

        <div className="flex justify-center pt-2">
          <WalletButton />
        </div>
      </div>

      <div className="mt-20 grid sm:grid-cols-3 gap-6 w-full max-w-3xl">
        {FEATURES.map(({ icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl p-6 space-y-3"
            style={{
              backgroundColor: 'var(--color-surface-1)',
              border: '1px solid var(--color-border)',
            }}
          >
            <span className="text-3xl">{icon}</span>
            <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {body}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-12 text-xs" style={{ color: 'var(--color-text-muted)' }}>
        Running on OPNet Testnet — use testnet BTC only
      </p>
    </div>
  )
}
