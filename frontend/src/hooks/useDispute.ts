import { useState, useCallback } from 'react'
import { getContract } from 'opnet'
import type { AbstractRpcProvider } from 'opnet'
import { useWallet } from './useWallet'
import { CONTRACT_ADDRESSES, OPNET_NETWORK } from '@/config'
import { DISPUTE_RESOLUTION_ABI } from '@/abis/DisputeResolution.abi'
import { decodeDisputeStatus } from '@/types'
import type { GetDisputeStatusResult, RaiseDisputeResult, DisputeStatus } from '@/types'

export function useDispute() {
  const { provider } = useWallet()

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
    )
  }

  const raiseDispute = useCallback(async (
    subject: string,
    attester: string,
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const contract = getDisputeContract() as unknown as { raiseDispute: (s: string, a: string) => Promise<RaiseDisputeResult> }
      const result = await contract.raiseDispute(subject, attester)
      return result.success
    } catch (e) {
      setError(String(e))
      return false
    } finally {
      setLoading(false)
    }
  }, [provider])

  const getDisputeStatus = useCallback(async (
    subject: string,
    attester: string,
  ): Promise<DisputeStatus> => {
    setLoading(true)
    setError(null)
    try {
      const contract = getDisputeContract() as unknown as { getDisputeStatus: (s: string, a: string) => Promise<GetDisputeStatusResult> }
      const result = await contract.getDisputeStatus(subject, attester)
      return decodeDisputeStatus(result.status)
    } catch (e) {
      setError(String(e))
      return 'none'
    } finally {
      setLoading(false)
    }
  }, [provider])

  return { raiseDispute, getDisputeStatus, loading, error }
}
