import { ABIDataTypes, BitcoinAbiTypes, OP_NET_ABI } from 'opnet';

export const IdentityRegistryEvents = [
    {
        name: 'IdentityRegistered',
        values: [{ name: 'addr', type: ABIDataTypes.ADDRESS }],
        type: BitcoinAbiTypes.Event,
    },
    {
        name: 'ProfileUpdated',
        values: [{ name: 'addr', type: ABIDataTypes.ADDRESS }],
        type: BitcoinAbiTypes.Event,
    },
];

export const IdentityRegistryAbi = [
    {
        name: 'register',
        inputs: [
            { name: 'sig', type: ABIDataTypes.BYTES },
            { name: 'msgHash', type: ABIDataTypes.BYTES },
        ],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'setProfile',
        inputs: [{ name: 'cid', type: ABIDataTypes.STRING }],
        outputs: [{ name: 'success', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'isRegistered',
        constant: true,
        inputs: [{ name: 'address', type: ABIDataTypes.ADDRESS }],
        outputs: [{ name: 'registered', type: ABIDataTypes.BOOL }],
        type: BitcoinAbiTypes.Function,
    },
    {
        name: 'getProfile',
        constant: true,
        inputs: [{ name: 'address', type: ABIDataTypes.ADDRESS }],
        outputs: [{ name: 'profile', type: ABIDataTypes.STRING }],
        type: BitcoinAbiTypes.Function,
    },
    ...IdentityRegistryEvents,
    ...OP_NET_ABI,
];

export default IdentityRegistryAbi;
