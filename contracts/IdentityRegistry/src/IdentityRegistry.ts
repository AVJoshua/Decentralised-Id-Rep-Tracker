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
} from '@btc-vision/btc-runtime/runtime';

// ─── Events ──────────────────────────────────────────────────────────────────

@final
class IdentityRegisteredEvent extends NetEvent {
    constructor(addr: Address) {
        const writer = new BytesWriter(32);
        writer.writeAddress(addr);
        super('IdentityRegistered', writer);
    }
}

@final
class ProfileUpdatedEvent extends NetEvent {
    constructor(addr: Address) {
        const writer = new BytesWriter(32);
        writer.writeAddress(addr);
        super('ProfileUpdated', writer);
    }
}

// ─── IdentityRegistry ────────────────────────────────────────────────────────
//
// Storage layout (pointer order is FIXED — never reorder):
//   ptr+0  _registeredPtr    AddressMemoryMap  addr → 1 if registered
//   ptr+1  _profileLenPtr    AddressMemoryMap  addr → CID byte length
//   ptr+2  _profileChunk0Ptr AddressMemoryMap  addr → first  32 bytes of CID
//   ptr+3  _profileChunk1Ptr AddressMemoryMap  addr → second 32 bytes of CID
//
// CIDs are stored in two 32-byte chunks (max 64 bytes), covering both
// CIDv0 (46 bytes, base58) and CIDv1 (59 bytes, base32).

@final
export class IdentityRegistry extends OP_NET {
    private readonly _registeredPtr: u16    = Blockchain.nextPointer;
    private readonly _profileLenPtr: u16    = Blockchain.nextPointer;
    private readonly _profileChunk0Ptr: u16 = Blockchain.nextPointer;
    private readonly _profileChunk1Ptr: u16 = Blockchain.nextPointer;

    // Fields are initialised with changetype<T>(0) so the AS compiler is satisfied
    // that all reference fields are set before `this` is accessed in the constructor.
    // The constructor immediately overwrites them with the real AddressMemoryMap instances.
    private _registered: AddressMemoryMap    = changetype<AddressMemoryMap>(0);
    private _profileLen: AddressMemoryMap    = changetype<AddressMemoryMap>(0);
    private _profileChunk0: AddressMemoryMap = changetype<AddressMemoryMap>(0);
    private _profileChunk1: AddressMemoryMap = changetype<AddressMemoryMap>(0);

    public constructor() {
        super();
        this._registered    = new AddressMemoryMap(this._registeredPtr);
        this._profileLen    = new AddressMemoryMap(this._profileLenPtr);
        this._profileChunk0 = new AddressMemoryMap(this._profileChunk0Ptr);
        this._profileChunk1 = new AddressMemoryMap(this._profileChunk1Ptr);
    }

    // ── register(sig: bytes, msgHash: bytes) → bool ───────────────────────────
    // OPNet authenticates every transaction via ML-DSA at the protocol level.
    // sig/msgHash are read and discarded — they're kept for ABI symmetry and
    // future signature-linking use.
    @method(
        { name: 'sig',     type: ABIDataTypes.BYTES },
        { name: 'msgHash', type: ABIDataTypes.BYTES },
    )
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    @emit('IdentityRegistered')
    public register(calldata: Calldata): BytesWriter {
        calldata.readBytesWithLength(); // sig
        calldata.readBytesWithLength(); // msgHash

        const sender: Address = Blockchain.tx.sender;

        if (u256.eq(this._registered.get(sender), u256.One)) {
            throw new Revert('Already registered');
        }

        this._registered.set(sender, u256.One);
        this.emitEvent(new IdentityRegisteredEvent(sender));

        const writer = new BytesWriter(1);
        writer.writeBoolean(true);
        return writer;
    }

    // ── setProfile(cid: string) → bool ───────────────────────────────────────
    @method({ name: 'cid', type: ABIDataTypes.STRING })
    @returns({ name: 'success', type: ABIDataTypes.BOOL })
    @emit('ProfileUpdated')
    public setProfile(calldata: Calldata): BytesWriter {
        const cid: string = calldata.readStringWithLength();

        if (cid.length === 0) {
            throw new Revert('Empty CID');
        }

        const sender: Address = Blockchain.tx.sender;

        if (u256.eq(this._registered.get(sender), u256.Zero)) {
            throw new Revert('Not registered');
        }

        this.storeCid(sender, cid);
        this.emitEvent(new ProfileUpdatedEvent(sender));

        const writer = new BytesWriter(1);
        writer.writeBoolean(true);
        return writer;
    }

    // ── isRegistered(address) → bool ─────────────────────────────────────────
    @view
    @method({ name: 'address', type: ABIDataTypes.ADDRESS })
    @returns({ name: 'registered', type: ABIDataTypes.BOOL })
    public isRegistered(calldata: Calldata): BytesWriter {
        const addr: Address = calldata.readAddress();
        const registered: bool = u256.eq(this._registered.get(addr), u256.One);
        const writer = new BytesWriter(1);
        writer.writeBoolean(registered);
        return writer;
    }

    // ── getProfile(address) → string ─────────────────────────────────────────
    @view
    @method({ name: 'address', type: ABIDataTypes.ADDRESS })
    @returns({ name: 'profile', type: ABIDataTypes.STRING })
    public getProfile(calldata: Calldata): BytesWriter {
        const addr: Address = calldata.readAddress();
        const cid: string = this.loadCid(addr);
        // writeString emits a 4-byte length prefix + UTF-8 bytes
        const writer = new BytesWriter(4 + cid.length);
        writer.writeString(cid);
        return writer;
    }

    // ── CID storage helpers ───────────────────────────────────────────────────

    private storeCid(addr: Address, cid: string): void {
        const cidBytes = Uint8Array.wrap(String.UTF8.encode(cid));
        const len: i32 = cidBytes.length;
        if (len > 64) {
            throw new Revert('CID too long (max 64 bytes)');
        }

        const chunk0 = new Uint8Array(32);
        const chunk1 = new Uint8Array(32);

        const bound0: i32 = len < 32 ? len : 32;
        for (let i: i32 = 0; i < bound0; i++) {
            chunk0[i] = cidBytes[i];
        }
        if (len > 32) {
            for (let i: i32 = 32; i < len; i++) {
                chunk1[i - 32] = cidBytes[i];
            }
        }

        this._profileLen.set(addr, u256.fromU32(u32(len)));
        this._profileChunk0.setAsUint8Array(addr, chunk0);
        this._profileChunk1.setAsUint8Array(addr, chunk1);
    }

    private loadCid(addr: Address): string {
        const lenU256 = this._profileLen.get(addr);
        if (u256.eq(lenU256, u256.Zero)) {
            return '';
        }
        const len: i32 = i32(lenU256.toU32());

        const chunk0 = this._profileChunk0.getAsUint8Array(addr);
        const chunk1 = this._profileChunk1.getAsUint8Array(addr);

        const cidBytes = new Uint8Array(len);
        const bound0: i32 = len < 32 ? len : 32;
        for (let i: i32 = 0; i < bound0; i++) {
            cidBytes[i] = chunk0[i];
        }
        if (len > 32) {
            for (let i: i32 = 32; i < len; i++) {
                cidBytes[i] = chunk1[i - 32];
            }
        }
        return String.UTF8.decode(cidBytes.buffer);
    }
}
