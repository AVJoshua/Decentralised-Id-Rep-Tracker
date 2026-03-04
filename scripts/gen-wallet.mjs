/**
 * DIRT wallet key generator
 *
 * Generates a fresh classical + ML-DSA keypair for OPNet testnet deployment.
 * Fund the P2TR address with signet BTC before running deployment scripts.
 *
 * Usage:  node scripts/gen-wallet.mjs
 */

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const { Wallet } = require('./node_modules/@btc-vision/transaction/build/index.js');
const { networks } = require('./node_modules/@btc-vision/bitcoin/build/index.js');

const OPNET_NETWORK = networks['opnetTestnet'] ?? networks.testnet;

const wallet = Wallet.generate(OPNET_NETWORK);

console.log('=== DIRT Testnet Wallet ===');
console.log('');
console.log('P2TR address (fund this):');
console.log(wallet.p2tr);
console.log('');
console.log('Set these in your shell before deploying:');
console.log(`export PRIVATE_KEY_WIF="${wallet.toWIF()}"`);
console.log(`export MLDSA_PRIVATE_KEY_BASE58="${wallet.toQuantumBase58()}"`);
console.log('');
console.log('KEEP THESE PRIVATE — never commit them to git.');
