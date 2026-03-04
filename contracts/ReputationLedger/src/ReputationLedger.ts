import { u256 } from '@btc-vision/as-bignum/assembly';
import {
    Address,
    AddressMemoryMap,
    Blockchain,
    BytesWriter,
    Calldata,
    NetEvent,
    OP_NET,
    Revert,
    SafeMath,
    StoredMapU256,
} from '@btc-vision/btc-runtime/runtime';

// ─── Events ──────────────────────────────────────────────────────────────────

@final
class AttestedEvent extends NetEvent {
    constructor(attester: Address, subject: Address, score: u256) {
        // 32 (attester) + 32 (subject) + 32 (score) = 96 bytes
        const writer = new BytesWriter(96);
        writer.writeAddress(attester);
        writer.writeAddress(subject);
        writer.writeU256(score);
        super('Attested', writer);
    }
}

// ─── ReputationLedger ────────────────────────────────────────────────────────
//
// Storage layout (pointer order is FIXED — never reorder):
//   ptr+0  _scoresPtr        AddressMemoryMap  addr → cumulative score (u256)
//   ptr+1  _reviewCountsPtr  AddressMemoryMap  addr → attestation count
//   ptr+2  _attestedPtr      StoredMapU256     sha256(attester‖subject) → 1/0
//
// Score range per attestation: [1, 100].
// getScore() returns the cumulative total; divide by getReviewCount() for avg.

@final
export class ReputationLedger extends OP_NET {
    private readonly _scoresPtr: u16       = Blockchain.nextPointer;
    private readonly _reviewCountsPtr: u16 = Blockchain.nextPointer;
    private readonly _attestedPtr: u16     = Blockchain.nextPointer;

    private _scores: AddressMemoryMap       = changetype<AddressMemoryMap>(0);
    private _reviewCounts: AddressMemoryMap = changetype<AddressMemoryMap>(0);
    private _attested: StoredMapU256        = changetype<StoredMapU256>(0);

    private static readonly MAX_SCORE: u256 = u256.fromU32(100);
    private static readonly MIN_SCORE: u256 = u256.One;

    public constructor() {
        super();
        this._scores       = new AddressMemoryMap(this._scoresPtr);
        this._reviewCounts = new AddressMemoryMap(this._reviewCountsPtr);
        this._attested     = new StoredMapU256(this._attestedPtr);
    }

    // ── attest(subject: address, score: uint256) → bool ──────────────────────
    @method(
        { name: 'subject', type: ABIDataTypes.ADDRESS },
        { name: 'score',   type: ABIDataTypes.UINT256 },
    )
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    @emit('Attested')
    public attest(calldata: Calldata): BytesWriter {
        const subject: Address = calldata.readAddress();
        const score: u256      = calldata.readU256();
        const sender: Address  = Blockchain.tx.sender;

        if (subject.equals(sender)) {
            throw new Revert('Cannot self-attest');
        }

        if (u256.lt(score, ReputationLedger.MIN_SCORE) || u256.gt(score, ReputationLedger.MAX_SCORE)) {
            throw new Revert('Score must be between 1 and 100');
        }

        const key = this.attestedKey(sender, subject);
        if (u256.eq(this._attested.get(key), u256.One)) {
            throw new Revert('Already attested to this address');
        }

        this._scores.set(subject, SafeMath.add(this._scores.get(subject), score));
        this._reviewCounts.set(subject, SafeMath.add(this._reviewCounts.get(subject), u256.One));
        this._attested.set(key, u256.One);

        this.emitEvent(new AttestedEvent(sender, subject, score));

        const writer = new BytesWriter(1);
        writer.writeBoolean(true);
        return writer;
    }

    // ── getScore(address) → uint256 ───────────────────────────────────────────
    @view
    @method({ name: 'address', type: ABIDataTypes.ADDRESS })
    @returns({ name: 'score', type: ABIDataTypes.UINT256 })
    public getScore(calldata: Calldata): BytesWriter {
        const addr: Address = calldata.readAddress();
        const writer = new BytesWriter(32);
        writer.writeU256(this._scores.get(addr));
        return writer;
    }

    // ── getReviewCount(address) → uint32 ─────────────────────────────────────
    @view
    @method({ name: 'address', type: ABIDataTypes.ADDRESS })
    @returns({ name: 'count', type: ABIDataTypes.UINT32 })
    public getReviewCount(calldata: Calldata): BytesWriter {
        const addr: Address = calldata.readAddress();
        const count: u256   = this._reviewCounts.get(addr);
        const writer = new BytesWriter(4);
        writer.writeU32(count.toU32());
        return writer;
    }

    // ── hasAttested(attester: address, subject: address) → bool ──────────────
    @view
    @method(
        { name: 'attester', type: ABIDataTypes.ADDRESS },
        { name: 'subject',  type: ABIDataTypes.ADDRESS },
    )
    @returns({ name: 'result', type: ABIDataTypes.BOOL })
    public hasAttested(calldata: Calldata): BytesWriter {
        const attester: Address = calldata.readAddress();
        const subject: Address  = calldata.readAddress();
        const key = this.attestedKey(attester, subject);
        const result: bool = u256.eq(this._attested.get(key), u256.One);
        const writer = new BytesWriter(1);
        writer.writeBoolean(result);
        return writer;
    }

    // ── Internal helpers ─────────────────────────────────────────────────────

    private attestedKey(attester: Address, subject: Address): u256 {
        const combined = new Uint8Array(64);
        combined.set(attester, 0);
        combined.set(subject, 32);
        return u256.fromBytes(Blockchain.sha256(combined));
    }
}
