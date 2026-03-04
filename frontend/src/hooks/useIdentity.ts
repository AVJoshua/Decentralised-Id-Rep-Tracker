import { useState, useCallback } from 'react'
import { getContract } from 'opnet'
import type { AbstractRpcProvider } from 'opnet'
import { useWallet } from './useWallet'
import { CONTRACT_ADDRESSES, OPNET_NETWORK } from '@/config'
import { IDENTITY_REGISTRY_ABI } from '@/abis/IdentityRegistry.abi'
import type {
  IsRegisteredResult,
  GetProfileResult,
  RegisterResult,
  SetProfileResult,
} from '@/types'

export function useIdentity() {
  const { provider, walletAddress } = useWallet()

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  // Cast provider to opnet's AbstractRpcProvider to resolve peer dep version mismatch
  function getIdentityContract() {
    if (!provider) throw new Error('Wallet not connected')
    return getContract(
      CONTRACT_ADDRESSES.IDENTITY_REGISTRY,
      IDENTITY_REGISTRY_ABI,
      provider as unknown as AbstractRpcProvider,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      OPNET_NETWORK as any,
    )
  }

  const isRegistered = useCallback(async (address?: string): Promise<boolean> => {
    const target = address ?? walletAddress
    if (!target) return false
    setLoading(true)
    setError(null)
    try {
      const contract = getIdentityContract() as unknown as { isRegistered: (a: string) => Promise<IsRegisteredResult> }
      const result = await contract.isRegistered(target)
      return result.registered
    } catch (e) {
      setError(String(e))
      return false
    } finally {
      setLoading(false)
    }
  }, [provider, walletAddress])

  const getProfile = useCallback(async (address?: string): Promise<string> => {
    const target = address ?? walletAddress
    if (!target) return ''
    setLoading(true)
    setError(null)
    try {
      const contract = getIdentityContract() as unknown as { getProfile: (a: string) => Promise<GetProfileResult> }
      const result = await contract.getProfile(target)
      return result.profile
    } catch (e) {
      setError(String(e))
      return ''
    } finally {
      setLoading(false)
    }
  }, [provider, walletAddress])

  const register = useCallback(async (
    sig: Uint8Array,
    msgHash: Uint8Array,
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const contract = getIdentityContract() as unknown as { register: (s: Uint8Array, m: Uint8Array) => Promise<RegisterResult> }
      const result = await contract.register(sig, msgHash)
      return result.success
    } catch (e) {
      setError(String(e))
      return false
    } finally {
      setLoading(false)
    }
  }, [provider])

  const setProfile = useCallback(async (cid: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const contract = getIdentityContract() as unknown as { setProfile: (c: string) => Promise<SetProfileResult> }
      const result = await contract.setProfile(cid)
      return result.success
    } catch (e) {
      setError(String(e))
      return false
    } finally {
      setLoading(false)
    }
  }, [provider])

  return { isRegistered, getProfile, register, setProfile, loading, error }
}
