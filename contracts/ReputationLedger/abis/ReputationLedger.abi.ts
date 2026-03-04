import { ABIDataTypes, BitcoinAbiTypes, OP_NET_ABI } from 'opnet';

export const ReputationLedgerEvents = [
    {
        name: 'Attested',
        values: [
            { name: 'attester', type: ABIDataTypes.ADDRESS },
            { name: 'subject', type: ABIDataTypes.ADDRESS },
            { name: 'score', type: ABIDataTypes.UINT256 },
        ],
        type: BitcoinAbiTypes.Event,
    },
];

export const ReputationLedgerAbi = [
    {
        name: 'attest',
        inputs: [
            { name: 'subject', type: ABIDataTypes.ADDRESS },
            { name: 'score', type: ABIDataTypes.UINT256 },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getScore',
        constant: true,
        inputs: [{ name: 'address', type: ABIDataTypes.ADDRESS }],
        outputs: [{ name: 'score', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getReviewCount',
        constant: true,
        inputs: [{ name: 'address', type: ABIDataTypes.ADDRESS }],
        outputs: [{ name: 'count', type: ABIDataTypes.UINT32 }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'hasAttested',
        constant: true,
        inputs: [
            { name: 'attester', type: ABIDataTypes.ADDRESS },
            { name: 'subject', type: ABIDataTypes.ADDRESS },
        ],
        outputs: [{ name: 'result', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    ...ReputationLedgerEvents,
    ...OP_NET_ABI,
];

export default ReputationLedgerAbi;
