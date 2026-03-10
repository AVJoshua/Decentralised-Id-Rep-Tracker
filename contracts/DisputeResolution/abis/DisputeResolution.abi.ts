import { ABIDataTypes, BitcoinAbiTypes, OP_NET_ABI } from 'opnet';

export const DisputeResolutionEvents = [
    {
        name: 'DisputeRaised',
        values: [
            { name: 'raiser', type: ABIDataTypes.ADDRESS },
            { name: 'subject', type: ABIDataTypes.ADDRESS },
            { name: 'attester', type: ABIDataTypes.ADDRESS },
        ],
        type: BitcoinAbiTypes.Event,
    },
    {
        name: 'DisputeResolved',
        values: [
            { name: 'subject', type: ABIDataTypes.ADDRESS },
            { name: 'attester', type: ABIDataTypes.ADDRESS },
            { name: 'outcome', type: ABIDataTypes.UINT256 },
        ],
        type: BitcoinAbiTypes.Event,
    },
];

export const DisputeResolutionAbi = [
    {
        name: 'raiseDispute',
        inputs: [
            { name: 'subject', type: ABIDataTypes.ADDRESS },
            { name: 'attester', type: ABIDataTypes.ADDRESS },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'resolveDispute',
        inputs: [
            { name: 'subject', type: ABIDataTypes.ADDRESS },
            { name: 'attester', type: ABIDataTypes.ADDRESS },
            { name: 'outcome', type: ABIDataTypes.UINT256 },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getDisputeStatus',
        constant: true,
        inputs: [
            { name: 'subject', type: ABIDataTypes.ADDRESS },
            { name: 'attester', type: ABIDataTypes.ADDRESS },
        ],
        outputs: [{ name: 'status', type: ABIDataTypes.UINT256 }],
        type: BitcoinAbiTypes.Function,
    },
    ...DisputeResolutionEvents,
    ...OP_NET_ABI,
];

export default DisputeResolutionAbi;
