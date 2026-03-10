import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import WalletButton from './WalletButton'
import { useWallet } from '@/hooks/useWallet'
import { useDisputeNotifications } from '@/hooks/useDisputeNotifications'
import { APP_CONFIG } from '@/config'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile',   label: 'Profile' },
  { to: '/attest',    label: 'Attest' },
  { to: '/disputes',  label: 'Disputes' },
]

export default function Navbar() {
  const { isConnected, walletAddress } = useWallet()
  const { pendingAgainstMe } = useDisputeNotifications(walletAddress)
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const activePath = location.pathname
  const pendingCount = pendingAgainstMe.length

  return (
    <nav
      style={{
        backgroundColor: 'var(--color-surface-1)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg shrink-0"
          style={{ color: 'var(--color-btc)' }}
          onClick={() => setMobileOpen(false)}
        >
          <span className="text-2xl">⬡</span>
          <span>{APP_CONFIG.name}</span>
        </Link>

        {/* Desktop nav */}
        {isConnected && (
          <ul className="hidden sm:flex items-center gap-1 flex-1">
            {NAV_LINKS.map(({ to, label }) => {
              const active = activePath.startsWith(to)
              const showBadge = to === '/disputes' && pendingCount > 0
              return (
                <li key={to}>
                  <Link
                    to={to}
                    className="relative px-3 py-1.5 rounded text-sm font-medium transition-colors"
                    style={{
                      color: active ? 'var(--color-btc)' : 'var(--color-text-secondary)',
                      backgroundColor: active ? 'rgba(247,147,26,0.1)' : 'transparent',
                    }}
                  >
                    {label}
                    {showBadge && (
                      <span
                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold"
                        style={{ backgroundColor: 'var(--color-error)', color: '#fff' }}
                      >
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        <div className="flex items-center gap-2">
          <WalletButton />

          {/* Mobile hamburger */}
          {isConnected && (
            <button
              className="sm:hidden p-2 rounded"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {isConnected && mobileOpen && (
        <div
          className="sm:hidden border-t"
          style={{
            backgroundColor: 'var(--color-surface-1)',
            borderColor: 'var(--color-border)',
          }}
        >
          <ul className="flex flex-col py-2 px-4 gap-1">
            {NAV_LINKS.map(({ to, label }) => {
              const active = activePath.startsWith(to)
              const showBadge = to === '/disputes' && pendingCount > 0
              return (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded text-sm font-medium"
                    style={{
                      color: active ? 'var(--color-btc)' : 'var(--color-text-secondary)',
                      backgroundColor: active ? 'rgba(247,147,26,0.1)' : 'transparent',
                    }}
                  >
                    {label}
                    {showBadge && (
                      <span
                        className="min-w-[20px] h-[20px] flex items-center justify-center rounded-full text-[10px] font-bold"
                        style={{ backgroundColor: 'var(--color-error)', color: '#fff' }}
                      >
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </nav>
  )
}
