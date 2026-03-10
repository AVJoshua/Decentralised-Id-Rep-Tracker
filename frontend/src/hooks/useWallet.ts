import { useWalletConnect } from '@btc-vision/walletconnect'

/**
 * Thin wrapper over @btc-vision/walletconnect's useWalletConnect.
 * isConnected = publicKey !== null  (NO isConnected property on the hook)
 * Use openConnectModal() to show the wallet picker.
 */
export function useWallet() {
  const wc = useWalletConnect()

  const isConnected = wc.publicKey !== null

  return {
    isConnected,
    publicKey:        wc.publicKey,
    walletAddress:    wc.walletAddress,
    address:          wc.address,          // Address object (has .toHex())
    provider:         wc.provider,
    signer:           wc.signer,
    network:          wc.network,
    openConnectModal: wc.openConnectModal,
    disconnect:       wc.disconnect,
    raw:              wc,
  }
}

export type UseWalletReturn = ReturnType<typeof useWallet>
