import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deployContract } from './deploy.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WASM = join(__dirname, '../../contracts/ReputationLedger/build/ReputationLedger.wasm');

const address = await deployContract(WASM);
console.log(`VITE_REPUTATION_LEDGER=${address}`);
