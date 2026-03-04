/**
 * DIRT Contract Deployment Helper
 *
 * Usage:
 *   1. Generate keys:  node -e "const {Wallet}=require('@btc-vision/transaction'); const w=Wallet.generate(require('@btc-vision/bitcoin').networks.testnet); console.log('WIF:',w.toWIF()); console.log('MLDSA:',w.toQuantumBase58()); console.log('P2TR:',w.p2tr);"
 *   2. Fund the P2TR address with testnet BTC (signet)
 *   3. Set env vars: PRIVATE_KEY_WIF, MLDSA_PRIVATE_KEY_BASE58
 *   4. Run: node dist/deploy-<contract>.js
 */

import { readFileSync } from 'node:fs';
import { JSONRpcProvider } from 'opnet';
import { TransactionFactory, Wallet } from '@btc-vision/transaction';
import { networks } from '@btc-vision/bitcoin';

// ─── Network ────────────────────────────────────────────────────────────────

// OPNet testnet is a Signet fork — MUST use opnetTestnet, NOT networks.testnet
const OPNET_NETWORK = (networks as unknown as Record<string, unknown>)['opnetTestnet'] as typeof networks.testnet ?? networks.testnet;
const RPC_URL = 'https://testnet.opnet.org';

// ─── Fee defaults ───────────────────────────────────────────────────────────

const DEFAULT_FEE_RATE   = 5;           // sat/vByte
const DEFAULT_GAS_SAT    = 10_000n;     // gas in satoshis
const DEFAULT_PRIORITY   = 0n;          // extra priority sat

// ─── Provider & Factory ─────────────────────────────────────────────────────

export function createProvider(): JSONRpcProvider {
    return new JSONRpcProvider({ url: RPC_URL, network: OPNET_NETWORK });
}

export const factory = new TransactionFactory();

// ─── Wallet ─────────────────────────────────────────────────────────────────

export function loadWallet(): Wallet {
    const wif   = process.env['PRIVATE_KEY_WIF'];
    const mldsa = process.env['MLDSA_PRIVATE_KEY_BASE58'];

    if (!wif || !mldsa) {
        throw new Error(
            'Set PRIVATE_KEY_WIF and MLDSA_PRIVATE_KEY_BASE58 environment variables.\n' +
            'Generate keys with: node scripts/gen-wallet.mjs',
        );
    }

    return Wallet.fromWif(wif, mldsa, OPNET_NETWORK);
}

// ─── Core deploy function ────────────────────────────────────────────────────

export async function deployContract(wasmPath: string): Promise<string> {
    const provider = createProvider();
    const wallet   = loadWallet();

    console.log(`Deployer P2TR: ${wallet.p2tr}`);
    console.log(`Loading bytecode from: ${wasmPath}`);

    const bytecode = readFileSync(wasmPath);

    // Fetch UTXOs for the deployer address
    const utxos = await provider.utxoManager.getUTXOs({ address: wallet.p2tr });
    if (utxos.length === 0) {
        throw new Error(
            `No UTXOs found for ${wallet.p2tr}.\n` +
            `Fund this address on OPNet testnet (signet) first.`,
        );
    }
    console.log(`Found ${utxos.length} UTXO(s)`);

    // Fetch gas parameters
    const gas = await provider.gasParameters();
    const feeRate = gas.bitcoin.recommended.medium ?? DEFAULT_FEE_RATE;
    console.log(`Fee rate: ${feeRate} sat/vByte | gasPerSat: ${gas.gasPerSat}`);

    // Fetch epoch challenge (solved PoW from the current epoch's winning miner)
    const challenge = await provider.getChallenge();
    console.log(`Epoch challenge: #${challenge.epochNumber}`);

    // Sign deployment (produces funding tx + reveal/deploy tx)
    const deployment = await factory.signDeployment({
        from:    wallet.p2tr,
        utxos,
        signer:  wallet.keypair,
        mldsaSigner: wallet.mldsaKeypair,
        network: OPNET_NETWORK,
        feeRate,
        priorityFee: DEFAULT_PRIORITY,
        gasSatFee:   DEFAULT_GAS_SAT,
        bytecode,
        challenge,
        linkMLDSAPublicKeyToAddress: true,
        revealMLDSAPublicKey: true,
    });

    console.log(`Contract address: ${deployment.contractAddress}`);

    // Broadcast funding transaction
    console.log('Broadcasting funding transaction...');
    const fundingResult = await provider.sendRawTransaction(deployment.transaction[0], false);
    if (!fundingResult.success) {
        throw new Error(`Funding transaction failed: ${JSON.stringify(fundingResult)}`);
    }
    console.log(`Funding TX: ${fundingResult.result ?? fundingResult}`);

    // Broadcast deploy transaction
    console.log('Broadcasting deploy transaction...');
    const deployResult = await provider.sendRawTransaction(deployment.transaction[1], false);
    if (!deployResult.success) {
        throw new Error(`Deploy transaction failed: ${JSON.stringify(deployResult)}`);
    }
    console.log(`Deploy TX: ${deployResult.result ?? deployResult}`);

    console.log(`\nDeployed successfully!`);
    console.log(`Contract address: ${deployment.contractAddress}`);
    console.log(`Add to frontend/.env.local:`);

    return deployment.contractAddress;
}
