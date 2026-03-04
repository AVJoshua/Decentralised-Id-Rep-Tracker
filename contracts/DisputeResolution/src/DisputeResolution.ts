import { u256 } from '@btc-vision/as-bignum/assembly';
import {
    Address,
    Blockchain,
    BytesWriter,
    Calldata,
    NetEvent,
    OP_NET,
    Revert,
    StoredMapU256,
} from '@btc-vision/btc-runtime/runtime';

// ─── Dispute status constants ─────────────────────────────────────────────────
// 0 = None     — no dispute recorded for this attestation pair
// 1 = Pending  — dispute raised, awaiting resolution
// 2 = Resolved — attestation upheld by governance
// 3 = Rejected — dispute rejected; attestation stands

// ─── Events ──────────────────────────────────────────────────────────────────

@final
class DisputeRaisedEvent extends NetEvent {
    constructor(raiser: Address, subject: Address, attester: Address) {
        // 32 (raiser) + 32 (subject) + 32 (attester) = 96 bytes
        const writer = new BytesWriter(96);
        writer.writeAddress(raiser);
        writer.writeAddress(subject);
        writer.writeAddress(attester);
        super('DisputeRaised', writer);
    }
}

// ─── DisputeResolution ───────────────────────────────────────────────────────
//
// Storage layout (pointer order is FIXED — never reorder):
//   ptr+0  _disputesPtr  StoredMapU256  sha256(subject‖attester) → status
//
// Anyone can raise a dispute (None → Pending). Resolve/Reject transitions
// are reserved for future governance module via upgrade.

@final
export class DisputeResolution extends OP_NET {
    private readonly _disputesPtr: u16 = Blockchain.nextPointer;

    private _disputes: StoredMapU256 = changetype<StoredMapU256>(0);

    private static readonly STATUS_NONE: u256    = u256.Zero;
    private static readonly STATUS_PENDING: u256 = u256.One;

    public constructor() {
        super();
        this._disputes = new StoredMapU256(this._disputesPtr);
    }

    // ── raiseDispute(subject: address, attester: address) → bool ─────────────
    @method(
        { name: 'subject',  type: ABIDataTypes.ADDRESS },
        { name: 'attester', type: ABIDataTypes.ADDRESS },
    )
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    @emit('DisputeRaised')
    public raiseDispute(calldata: Calldata): BytesWriter {
        const subject: Address  = calldata.readAddress();
        const attester: Address = calldata.readAddress();
        const raiser: Address   = Blockchain.tx.sender;

        const key = this.disputeKey(subject, attester);

        if (!u256.eq(this._disputes.get(key), DisputeResolution.STATUS_NONE)) {
            throw new Revert('Dispute already exists');
        }

        this._disputes.set(key, DisputeResolution.STATUS_PENDING);
        this.emitEvent(new DisputeRaisedEvent(raiser, subject, attester));

        const writer = new BytesWriter(1);
        writer.writeBoolean(true);
        return writer;
    }

    // ── getDisputeStatus(subject: address, attester: address) → uint256 ───────
    @view
    @method(
        { name: 'subject',  type: ABIDataTypes.ADDRESS },
        { name: 'attester', type: ABIDataTypes.ADDRESS },
    )
    @returns({ name: 'status', type: ABIDataTypes.UINT256 })
    public getDisputeStatus(calldata: Calldata): BytesWriter {
        const subject: Address  = calldata.readAddress();
        const attester: Address = calldata.readAddress();
        const status: u256 = this._disputes.get(this.disputeKey(subject, attester));
        const writer = new BytesWriter(32);
        writer.writeU256(status);
        return writer;
    }

    // ── Internal helpers ─────────────────────────────────────────────────────

    private disputeKey(subject: Address, attester: Address): u256 {
        const combined = new Uint8Array(64);
        combined.set(subject, 0);
        combined.set(attester, 32);
        return u256.fromBytes(Blockchain.sha256(combined));
    }
}
