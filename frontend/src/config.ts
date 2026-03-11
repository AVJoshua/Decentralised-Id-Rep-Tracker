import { networks } from '@btc-vision/bitcoin'

// ─── Contract Addresses ────────────────────────────────────────────────────────
// OPNet testnet contract addresses. Override via VITE_* env vars if needed.
export const CONTRACT_ADDRESSES = {
  IDENTITY_REGISTRY:  import.meta.env.VITE_IDENTITY_REGISTRY  ?? 'opt1sqpkzhw93evjcgcrgp5e53udmvr5xlqyx4yga7qug',
  REPUTATION_LEDGER:  import.meta.env.VITE_REPUTATION_LEDGER  ?? 'opt1sqp6hcqc3yt2uclve8d2pdxyf0tla9en9kgfmvk39',
  DISPUTE_RESOLUTION: import.meta.env.VITE_DISPUTE_RESOLUTION ?? 'opt1sqprda02rpucm8wvgs3y4cvaksgk234s0avufdjft',
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
