// ─── IdentityRegistry ─────────────────────────────────────────────────────────

export interface RegisterResult {
  success: boolean
}

export interface SetProfileResult {
  success: boolean
}

export interface IsRegisteredResult {
  registered: boolean
}

export interface GetProfileResult {
  profile: string
}

// ─── ReputationLedger ─────────────────────────────────────────────────────────

export interface AttestResult {
  success: boolean
}

export interface GetScoreResult {
  score: bigint
}

export interface GetReviewCountResult {
  count: number
}

export interface HasAttestedResult {
  result: boolean
}

// ─── DisputeResolution ────────────────────────────────────────────────────────

export interface RaiseDisputeResult {
  success: boolean
}

export interface GetDisputeStatusResult {
  // 0 = None, 1 = Pending, 2 = Resolved, 3 = Rejected
  status: bigint
}

// ─── UI-level types ───────────────────────────────────────────────────────────

export type DisputeStatus = 'none' | 'pending' | 'resolved' | 'rejected'

export function decodeDisputeStatus(raw: bigint): DisputeStatus {
  switch (raw) {
    case 0n: return 'none'
    case 1n: return 'pending'
    case 2n: return 'resolved'
    case 3n: return 'rejected'
    default:  return 'none'
  }
}

export interface ProfileData {
  address: string
  isRegistered: boolean
  cid: string
  score: bigint
  reviewCount: number
}
