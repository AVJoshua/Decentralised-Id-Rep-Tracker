import { Address, AddressMap, ExtendedAddressMap, SchnorrSignature } from '@btc-vision/transaction';
import { CallResult, OPNetEvent, IOP_NETContract } from 'opnet';

// ------------------------------------------------------------------
// Event Definitions
// ------------------------------------------------------------------
export type AttestedEvent = {
    readonly attester: Address;
    readonly subject: Address;
    readonly score: bigint;
};

// ------------------------------------------------------------------
// Call Results
// ------------------------------------------------------------------

/**
 * @description Represents the result of the attest function call.
 */
export type Attest = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<AttestedEvent>[]
>;

/**
 * @description Represents the result of the getScore function call.
 */
export type GetScore = CallResult<
    {
        score: bigint;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getReviewCount function call.
 */
export type GetReviewCount = CallResult<
    {
        count: number;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the hasAttested function call.
 */
export type HasAttested = CallResult<
    {
        result: boolean;
    },
    OPNetEvent<never>[]
>;

// ------------------------------------------------------------------
// IReputationLedger
// ------------------------------------------------------------------
export interface IReputationLedger extends IOP_NETContract {
    attest(subject: Address, score: bigint): Promise<Attest>;
    getScore(address: Address): Promise<GetScore>;
    getReviewCount(address: Address): Promise<GetReviewCount>;
    hasAttested(attester: Address, subject: Address): Promise<HasAttested>;
}
