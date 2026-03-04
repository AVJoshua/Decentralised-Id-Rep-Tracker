import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deployContract } from './deploy.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WASM = join(__dirname, '../../contracts/DisputeResolution/build/DisputeResolution.wasm');

const address = await deployContract(WASM);
console.log(`VITE_DISPUTE_RESOLUTION=${address}`);
