import { Address, AddressMap, ExtendedAddressMap, SchnorrSignature } from '@btc-vision/transaction';
import { CallResult, OPNetEvent, IOP_NETContract } from 'opnet';

// ------------------------------------------------------------------
// Event Definitions
// ------------------------------------------------------------------
export type IdentityRegisteredEvent = {
    readonly addr: Address;
};
export type ProfileUpdatedEvent = {
    readonly addr: Address;
};

// ------------------------------------------------------------------
// Call Results
// ------------------------------------------------------------------

/**
 * @description Represents the result of the register function call.
 */
export type Register = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<IdentityRegisteredEvent>[]
>;

/**
 * @description Represents the result of the setProfile function call.
 */
export type SetProfile = CallResult<
    {
        success: boolean;
    },
    OPNetEvent<ProfileUpdatedEvent>[]
>;

/**
 * @description Represents the result of the isRegistered function call.
 */
export type IsRegistered = CallResult<
    {
        registered: boolean;
    },
    OPNetEvent<never>[]
>;

/**
 * @description Represents the result of the getProfile function call.
 */
export type GetProfile = CallResult<
    {
        profile: string;
    },
    OPNetEvent<never>[]
>;

// ------------------------------------------------------------------
// IIdentityRegistry
// ------------------------------------------------------------------
export interface IIdentityRegistry extends IOP_NETContract {
    register(sig: Uint8Array, msgHash: Uint8Array): Promise<Register>;
    setProfile(cid: string): Promise<SetProfile>;
    isRegistered(address: Address): Promise<IsRegistered>;
    getProfile(address: Address): Promise<GetProfile>;
}
