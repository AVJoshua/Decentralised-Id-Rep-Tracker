import { useState, useCallback } from 'react'
import { getContract } from 'opnet'
import type { AbstractRpcProvider } from 'opnet'
import { useWallet } from './useWallet'
import { CONTRACT_ADDRESSES, OPNET_NETWORK } from '@/config'
import { IDENTITY_REGISTRY_ABI } from '@/abis/IdentityRegistry.abi'
import { resolveAddress } from './useAddressResolver'

export function useIdentity() {
  const { provider, walletAddress, address, network } = useWallet()

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  function getIdentityContract() {
    if (!provider) throw new Error('Wallet not connected')
    return getContract(
      CONTRACT_ADDRESSES.IDENTITY_REGISTRY,
      IDENTITY_REGISTRY_ABI,
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

  // ── Read-only: isRegistered ─────────────────────────────────────────────
  const isRegistered = useCallback(async (addr?: string): Promise<boolean> => {
    const target = addr ?? walletAddress
    if (!target) return false
    setLoading(true)
    setError(null)
    try {
      const contract = getIdentityContract()
      const addrObj = await resolveAddress(getProvider(), target)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (contract as any).isRegistered(addrObj)
      if (result.revert) return false
      return result.properties?.registered ?? false
    } catch (e) {
      setError(String(e))
      return false
    } finally {
      setLoading(false)
    }
  }, [provider, walletAddress])

  // ── Read-only: getProfile ───────────────────────────────────────────────
  const getProfile = useCallback(async (addr?: string): Promise<string> => {
    const target = addr ?? walletAddress
    if (!target) return ''
    setLoading(true)
    setError(null)
    try {
      const contract = getIdentityContract()
      const addrObj = await resolveAddress(getProvider(), target)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (contract as any).getProfile(addrObj)
      if (result.revert) return ''
      return result.properties?.profile ?? ''
    } catch (e) {
      setError(String(e))
      return ''
    } finally {
      setLoading(false)
    }
  }, [provider, walletAddress])

  // ── Write: register ─────────────────────────────────────────────────────
  const register = useCallback(async (): Promise<boolean> => {
    if (!walletAddress) throw new Error('Wallet not connected')
    setLoading(true)
    setError(null)
    try {
      const contract = getIdentityContract()
      // sig and msgHash are read & discarded by the contract — pass empty bytes
      const emptySig = new Uint8Array(0)
      const emptyHash = new Uint8Array(0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sim = await (contract as any).register(emptySig, emptyHash)

      if (sim.revert) {
        setError(`Simulation reverted: ${sim.revert}`)
        return false
      }

      // Send the transaction — frontend: signer=null, wallet handles signing
      const receipt = await sim.sendTransaction({
        signer: null,
        mldsaSigner: null,
        refundTo: walletAddress,
        maximumAllowedSatToSpend: 100_000n,
        network: network ?? OPNET_NETWORK,
      })

      console.log('Register TX:', receipt.transactionId)
      return true
    } catch (e) {
      console.error('register error:', e)
      setError(String(e))
      return false
    } finally {
      setLoading(false)
    }
  }, [provider, walletAddress, network])

  // ── Write: setProfile ───────────────────────────────────────────────────
  const setProfile = useCallback(async (cid: string): Promise<boolean> => {
    if (!walletAddress) throw new Error('Wallet not connected')
    setLoading(true)
    setError(null)
    try {
      const contract = getIdentityContract()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sim = await (contract as any).setProfile(cid)

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

      console.log('SetProfile TX:', receipt.transactionId)
      return true
    } catch (e) {
      console.error('setProfile error:', e)
      setError(String(e))
      return false
    } finally {
      setLoading(false)
    }
  }, [provider, walletAddress, network])

  return { isRegistered, getProfile, register, setProfile, loading, error }
}
