import { ABIDataTypes, BitcoinAbiTypes } from 'opnet'
import type { BitcoinInterfaceAbi } from 'opnet'

export const REPUTATION_LEDGER_ABI: BitcoinInterfaceAbi = [
  {
    name: 'attest',
    type: BitcoinAbiTypes.Function,
    inputs: [
      { name: 'subject', type: ABIDataTypes.ADDRESS },
      { name: 'score',   type: ABIDataTypes.UINT256 },
    ],
    outputs: [
      { name: 'success', type: ABIDataTypes.BOOL },
    ],
  },
  {
    name: 'getScore',
    type: BitcoinAbiTypes.Function,
    inputs: [
      { name: 'address', type: ABIDataTypes.ADDRESS },
    ],
    outputs: [
      { name: 'score', type: ABIDataTypes.UINT256 },
    ],
  },
  {
    name: 'getReviewCount',
    type: BitcoinAbiTypes.Function,
    inputs: [
      { name: 'address', type: ABIDataTypes.ADDRESS },
    ],
    outputs: [
      { name: 'count', type: ABIDataTypes.UINT32 },
    ],
  },
  {
    name: 'hasAttested',
    type: BitcoinAbiTypes.Function,
    inputs: [
      { name: 'attester', type: ABIDataTypes.ADDRESS },
      { name: 'subject',  type: ABIDataTypes.ADDRESS },
    ],
    outputs: [
      { name: 'result', type: ABIDataTypes.BOOL },
    ],
  },
]
