import { useState, useCallback } from 'react'
import { getContract } from 'opnet'
import type { AbstractRpcProvider } from 'opnet'
import { useWallet } from './useWallet'
import { CONTRACT_ADDRESSES, OPNET_NETWORK } from '@/config'
import { REPUTATION_LEDGER_ABI } from '@/abis/ReputationLedger.abi'
import { resolveAddress } from './useAddressResolver'

export function useReputation() {
  const { provider, walletAddress, address, network } = useWallet()

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
      address ?? undefined,
    )
  }

  function getProvider(): AbstractRpcProvider {
    if (!provider) throw new Error('Wallet not connected')
    return provider as unknown as AbstractRpcProvider
  }

  // ── Read-only: getScore ─────────────────────────────────────────────────
  const getScore = useCallback(async (addr?: string): Promise<bigint> => {
    const target = addr ?? walletAddress
    if (!target) return 0n
    setLoading(true)
    setError(null)
    try {
      const contract = getReputationContract()
      const addrObj = await resolveAddress(getProvider(), target)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (contract as any).getScore(addrObj)
      if (result.revert) return 0n
      return result.properties?.score ?? 0n
    } catch (e) {
      setError(String(e))
      return 0n
    } finally {
      setLoading(false)
    }
  }, [provider, walletAddress])

  // ── Read-only: getReviewCount ───────────────────────────────────────────
  const getReviewCount = useCallback(async (addr?: string): Promise<number> => {
    const target = addr ?? walletAddress
    if (!target) return 0
    setLoading(true)
    setError(null)
    try {
      const contract = getReputationContract()
      const addrObj = await resolveAddress(getProvider(), target)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (contract as any).getReviewCount(addrObj)
      if (result.revert) return 0
      return Number(result.properties?.count ?? 0)
    } catch (e) {
      setError(String(e))
      return 0
    } finally {
      setLoading(false)
    }
  }, [provider, walletAddress])

  // ── Read-only: hasAttested ──────────────────────────────────────────────
  const hasAttested = useCallback(async (
    attester: string,
    subject: string,
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const contract = getReputationContract()
      const p = getProvider()
      const [attesterAddr, subjectAddr] = await Promise.all([
        resolveAddress(p, attester),
        resolveAddress(p, subject),
      ])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (contract as any).hasAttested(attesterAddr, subjectAddr)
      if (result.revert) return false
      return result.properties?.result ?? false
    } catch (e) {
      setError(String(e))
      return false
    } finally {
      setLoading(false)
    }
  }, [provider])

  // ── Write: attest ───────────────────────────────────────────────────────
  const attest = useCallback(async (
    subject: string,
    score: number,
  ): Promise<boolean> => {
    if (!walletAddress) throw new Error('Wallet not connected')
    setLoading(true)
    setError(null)
    try {
      const contract = getReputationContract()
      const subjectAddr = await resolveAddress(getProvider(), subject)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sim = await (contract as any).attest(subjectAddr, BigInt(score))

      if (sim.revert) {
        setError(`Simulation reverted: ${sim.revert}`)
        return false
      }

      const receipt = await sim.sendTransaction({
        signer: null,
        mldsaSigner: null,
        refundTo: walletAddress,
        maximumAllowedSatToSpend: 100_000n,
        network: network ?? OPNET_NETWORK,
      })

      console.log('Attest TX:', receipt.transactionId)
      return true
    } catch (e) {
      console.error('attest error:', e)
      setError(String(e))
      return false
    } finally {
      setLoading(false)
    }
  }, [provider, walletAddress, network])

  return { getScore, getReviewCount, hasAttested, attest, loading, error }
}
