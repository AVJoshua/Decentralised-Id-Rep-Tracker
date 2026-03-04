import { useWallet } from '@/hooks/useWallet'

function truncate(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function WalletButton() {
  const { isConnected, walletAddress, openConnectModal, disconnect } = useWallet()

  if (!isConnected) {
    return (
      <button
        onClick={openConnectModal}
        className="px-4 py-2 rounded font-medium text-sm transition-opacity hover:opacity-80"
        style={{ backgroundColor: 'var(--color-btc)', color: '#000' }}
      >
        Connect Wallet
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-mono"
        style={{
          backgroundColor: 'var(--color-surface-3)',
          color: 'var(--color-text-secondary)',
          border: '1px solid var(--color-border)',
        }}
      >
        <span
          className="w-2 h-2 rounded-full inline-block"
          style={{ backgroundColor: 'var(--color-success)' }}
        />
        {walletAddress ? truncate(walletAddress) : '—'}
      </span>
      <button
        onClick={() => void disconnect?.()}
        className="px-3 py-1.5 rounded text-sm font-medium transition-opacity hover:opacity-80"
        style={{
          color: 'var(--color-error)',
          border: '1px solid var(--color-error)',
          backgroundColor: 'transparent',
        }}
      >
        Disconnect
      </button>
    </div>
  )
}
