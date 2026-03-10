import type { AbstractRpcProvider } from 'opnet'
import { Address } from '@btc-vision/transaction'

/**
 * Resolves an opt1.../bc1p... string address to an Address object
 * using the provider's getPublicKeyInfo RPC call.
 */
export async function resolveAddress(
  provider: AbstractRpcProvider,
  addressStr: string,
): Promise<Address> {
  const result = await provider.getPublicKeyInfo(addressStr, false)
  if (!result) {
    throw new Error(`Could not resolve address: ${addressStr}`)
  }
  return result
}
