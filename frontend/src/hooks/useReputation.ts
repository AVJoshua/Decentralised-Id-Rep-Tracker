import { useState, useCallback } from 'react'
import { getContract } from 'opnet'
import type { AbstractRpcProvider } from 'opnet'
import { useWallet } from './useWallet'
import { CONTRACT_ADDRESSES, OPNET_NETWORK } from '@/config'
import { REPUTATION_LEDGER_ABI } from '@/abis/ReputationLedger.abi'
import type {
  GetScoreResult,
  GetReviewCountResult,
  HasAttestedResult,
  AttestResult,
} from '@/types'

export function useReputation() {
  const { provider, walletAddress } = useWallet()

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  function getReputationContract() {
    if (!provider) throw new Error('Wallet not connected')
    return getContract(
      CONTRACT_ADDRESSES.REPUTATION_LEDGER,
      REPUTATION_LEDGER_ABI,
      provider as unknown as AbstractRpcProvider,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      OPNET_NETWORK as any,
    )
  }

  const getScore = useCallback(async (address?: string): Promise<bigint> => {
    const target = address ?? walletAddress
    if (!target) return 0n
    setLoading(true)
    setError(null)
    try {
      const contract = getReputationContract() as unknown as { getScore: (a: string) => Promise<GetScoreResult> }
      const result = await contract.getScore(target)
      return result.score
    } catch (e) {
      setError(String(e))
      return 0n
    } finally {
      setLoading(false)
    }
  }, [provider, walletAddress])

  const getReviewCount = useCallback(async (address?: string): Promise<number> => {
    const target = address ?? walletAddress
    if (!target) return 0
    setLoading(true)
    setError(null)
    try {
      const contract = getReputationContract() as unknown as { getReviewCount: (a: string) => Promise<GetReviewCountResult> }
      const result = await contract.getReviewCount(target)
      return result.count
    } catch (e) {
      setError(String(e))
      return 0
    } finally {
      setLoading(false)
    }
  }, [provider, walletAddress])

  const hasAttested = useCallback(async (
    attester: string,
    subject: string,
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const contract = getReputationContract() as unknown as { hasAttested: (a: string, s: string) => Promise<HasAttestedResult> }
      const result = await contract.hasAttested(attester, subject)
      return result.result
    } catch (e) {
      setError(String(e))
      return false
    } finally {
      setLoading(false)
    }
  }, [provider])

  const attest = useCallback(async (
    subject: string,
    score: number,
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const contract = getReputationContract() as unknown as { attest: (s: string, sc: bigint) => Promise<AttestResult> }
      const result = await contract.attest(subject, BigInt(score))
      return result.success
    } catch (e) {
      setError(String(e))
      return false
    } finally {
      setLoading(false)
    }
  }, [provider])

  return { getScore, getReviewCount, hasAttested, attest, loading, error }
}
