import { Address, AddressMap, ExtendedAddressMap, SchnorrSignature } from '@btc-vision/transaction';
import { CallResult, OPNetEvent, IOP_NETContract } from 'opnet';

// ------------------------------------------------------------------
// Event Definitions
// ------------------------------------------------------------------
export type DisputeRaisedEvent = {
    readonly raiser: Address;
    readonly subject: Address;
    readonly attester: Address;
};
export type DisputeResolvedEvent = {
    readonly subject: Address;
    readonly attester: Address;
    readonly outcome: bigint;
};

// ------------------------------------------------------------------
// Call Results
// ------------------------------------------------------------------

/**
 * @description Represents the result of the raiseDispute function call.
 */
export type RaiseDispute = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<DisputeRaisedEvent>[]
>;

/**
 * @description Represents the result of the resolveDispute function call.
 */
export type ResolveDispute = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<DisputeResolvedEvent>[]
>;

/**
 * @description Represents the result of the getDisputeStatus function call.
 */
export type GetDisputeStatus = CallResult<
    {
        status: bigint;
    },
    OPNetEvent<never>[]
>;

// ------------------------------------------------------------------
// IDisputeResolution
// ------------------------------------------------------------------
export interface IDisputeResolution extends IOP_NETContract {
    raiseDispute(subject: Address, attester: Address): Promise<RaiseDispute>;
    resolveDispute(subject: Address, attester: Address, outcome: bigint): Promise<ResolveDispute>;
    getDisputeStatus(subject: Address, attester: Address): Promise<GetDisputeStatus>;
}
