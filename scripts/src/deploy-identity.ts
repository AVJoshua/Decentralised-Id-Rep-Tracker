import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deployContract } from './deploy.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const WASM = join(__dirname, '../../contracts/IdentityRegistry/build/IdentityRegistry.wasm');

const address = await deployContract(WASM);
console.log(`VITE_IDENTITY_REGISTRY=${address}`);
