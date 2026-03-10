import { useState, useCallback } from 'react'
import { getContract } from 'opnet'
import type { AbstractRpcProvider } from 'opnet'
import { useWallet } from './useWallet'
import { CONTRACT_ADDRESSES, OPNET_NETWORK } from '@/config'
import { DISPUTE_RESOLUTION_ABI } from '@/abis/DisputeResolution.abi'
import { decodeDisputeStatus } from '@/types'
import type { DisputeStatus } from '@/types'
import { resolveAddress } from './useAddressResolver'

export function useDispute() {
  const { provider, walletAddress, address, network } = useWallet()

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  function getDisputeContract() {
    if (!provider) throw new Error('Wallet not connected')
    return getContract(
      CONTRACT_ADDRESSES.DISPUTE_RESOLUTION,
      DISPUTE_RESOLUTION_ABI,
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

  // ── Write: raiseDispute ─────────────────────────────────────────────────
  const raiseDispute = useCallback(async (
    subject: string,
    attester: string,
  ): Promise<boolean> => {
    if (!walletAddress) throw new Error('Wallet not connected')
    setLoading(true)
    setError(null)
    try {
      const contract = getDisputeContract()
      const p = getProvider()
      const [subjectAddr, attesterAddr] = await Promise.all([
        resolveAddress(p, subject),
        resolveAddress(p, attester),
      ])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sim = await (contract as any).raiseDispute(subjectAddr, attesterAddr)

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

      console.log('RaiseDispute TX:', receipt.transactionId)
      return true
    } catch (e) {
      console.error('raiseDispute error:', e)
      setError(String(e))
      return false
    } finally {
      setLoading(false)
    }
  }, [provider, walletAddress, network])

  // ── Read-only: getDisputeStatus ─────────────────────────────────────────
  const getDisputeStatus = useCallback(async (
    subject: string,
    attester: string,
  ): Promise<DisputeStatus> => {
    setLoading(true)
    setError(null)
    try {
      const contract = getDisputeContract()
      const p = getProvider()
      const [subjectAddr, attesterAddr] = await Promise.all([
        resolveAddress(p, subject),
        resolveAddress(p, attester),
      ])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (contract as any).getDisputeStatus(subjectAddr, attesterAddr)
      if (result.revert) return 'none'
      const statusVal = result.properties?.status
      return decodeDisputeStatus(statusVal ?? 0n)
    } catch (e) {
      setError(String(e))
      return 'none'
    } finally {
      setLoading(false)
    }
  }, [provider])

  return { raiseDispute, getDisputeStatus, loading, error }
}
