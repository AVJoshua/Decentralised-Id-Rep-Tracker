import { networks } from '@btc-vision/bitcoin'

// ─── Contract Addresses ────────────────────────────────────────────────────────
// Replace via .env.local once contracts are deployed to OPNet testnet.
// Format: bc1p... (Taproot P2TR)
export const CONTRACT_ADDRESSES = {
  IDENTITY_REGISTRY:  import.meta.env.VITE_IDENTITY_REGISTRY  ?? 'bc1p__IDENTITY_REGISTRY_PLACEHOLDER__',
  REPUTATION_LEDGER:  import.meta.env.VITE_REPUTATION_LEDGER  ?? 'bc1p__REPUTATION_LEDGER_PLACEHOLDER__',
  DISPUTE_RESOLUTION: import.meta.env.VITE_DISPUTE_RESOLUTION ?? 'bc1p__DISPUTE_RESOLUTION_PLACEHOLDER__',
} as const

// ─── Network ───────────────────────────────────────────────────────────────────
// Uses opnetTestnet from @btc-vision/bitcoin@7.x — a Signet fork, NOT Testnet4.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const OPNET_NETWORK = (networks as unknown as Record<string, unknown>)['opnetTestnet'] ?? networks.testnet

// ─── App Config ────────────────────────────────────────────────────────────────
export const APP_CONFIG = {
  name: 'DIRT',
  fullName: 'Decentralised Identity & Reputation Tracker',
  maxAttestationScore: 100,
  minAttestationScore: 1,
} as const
