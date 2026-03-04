import { ABIDataTypes } from 'opnet'
import { BitcoinAbiTypes } from 'opnet'
import type { BitcoinInterfaceAbi } from 'opnet'

export const IDENTITY_REGISTRY_ABI: BitcoinInterfaceAbi = [
  {
    name: 'register',
    type: BitcoinAbiTypes.Function,
    inputs: [
      { name: 'sig',     type: ABIDataTypes.BYTES },
      { name: 'msgHash', type: ABIDataTypes.BYTES },
    ],
    outputs: [
      { name: 'success', type: ABIDataTypes.BOOL },
    ],
  },
  {
    name: 'setProfile',
    type: BitcoinAbiTypes.Function,
    inputs: [
      { name: 'cid', type: ABIDataTypes.STRING },
    ],
    outputs: [
      { name: 'success', type: ABIDataTypes.BOOL },
    ],
  },
  {
    name: 'isRegistered',
    type: BitcoinAbiTypes.Function,
    inputs: [
      { name: 'address', type: ABIDataTypes.ADDRESS },
    ],
    outputs: [
      { name: 'registered', type: ABIDataTypes.BOOL },
    ],
  },
  {
    name: 'getProfile',
    type: BitcoinAbiTypes.Function,
    inputs: [
      { name: 'address', type: ABIDataTypes.ADDRESS },
    ],
    outputs: [
      { name: 'profile', type: ABIDataTypes.STRING },
    ],
  },
]
