import { Blockchain } from '@btc-vision/btc-runtime/runtime';
import { DisputeResolution } from './DisputeResolution';
import { revertOnError } from '@btc-vision/btc-runtime/runtime/abort/abort';

Blockchain.contract = (): DisputeResolution => {
    return new DisputeResolution();
};

export * from '@btc-vision/btc-runtime/runtime/exports';

export function abort(message: string, fileName: string, line: u32, column: u32): void {
    revertOnError(message, fileName, line, column);
}
