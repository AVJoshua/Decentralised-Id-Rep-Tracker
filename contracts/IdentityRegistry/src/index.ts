import { Blockchain } from '@btc-vision/btc-runtime/runtime';
import { IdentityRegistry } from './IdentityRegistry';
import { revertOnError } from '@btc-vision/btc-runtime/runtime/abort/abort';

Blockchain.contract = (): IdentityRegistry => {
    return new IdentityRegistry();
};

export * from '@btc-vision/btc-runtime/runtime/exports';

export function abort(message: string, fileName: string, line: u32, column: u32): void {
    revertOnError(message, fileName, line, column);
}
