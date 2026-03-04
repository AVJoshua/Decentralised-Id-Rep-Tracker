import { ABIDataTypes, BitcoinAbiTypes } from 'opnet'
import type { BitcoinInterfaceAbi } from 'opnet'

export const DISPUTE_RESOLUTION_ABI: BitcoinInterfaceAbi = [
  {
    name: 'raiseDispute',
    type: BitcoinAbiTypes.Function,
    inputs: [
      { name: 'subject',  type: ABIDataTypes.ADDRESS },
      { name: 'attester', type: ABIDataTypes.ADDRESS },
    ],
    outputs: [
      { name: 'success', type: ABIDataTypes.BOOL },
    ],
  },
  {
    name: 'getDisputeStatus',
    type: BitcoinAbiTypes.Function,
    inputs: [
      { name: 'subject',  type: ABIDataTypes.ADDRESS },
      { name: 'attester', type: ABIDataTypes.ADDRESS },
    ],
    outputs: [
      { name: 'status', type: ABIDataTypes.UINT256 },
    ],
  },
]
