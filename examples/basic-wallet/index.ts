import { SolanaWallet } from '@chain-guard/core/wallet/solana-wallet';
import { ThreatDetector } from '@chain-guard/core/ai/threat-detector';

/**
 * Basic Wallet Example
 * 
 * This example demonstrates how to create a wallet,
 * check balance, and send transactions with Chain Guard.
 */

async function main() {
  console.log('Chain Guard - Basic Wallet Example\n');

  // Step 1: Create a new wallet
  console.log('1. Creating wallet...');
  const wallet = new SolanaWallet({
    network: 'devnet',
    commitment: 'confirmed'
  });

  // Step 2: Generate mnemonic
  console.log('2. Generating mnemonic...');
  const mnemonic = await wallet.generateMnemonic();
  console.log('Mnemonic:', mnemonic);
  console.log('⚠️  Save this mnemonic securely!\n');

  // Step 3: Import wallet from mnemonic
  console.log('3. Importing wallet...');
  const password = 'secure-password-123';
  await wallet.importFromMnemonic(mnemonic, password);

  // Step 4: Get public key
  console.log('4. Getting public key...');
  const publicKey = await wallet.getPublicKey();
  console.log('Public Key:', publicKey.toString(), '\n');

  // Step 5: Check balance
  console.log('5. Checking balance...');
  const balance = await wallet.getBalance();
  console.log('Balance:', balance, 'SOL\n');

  // Step 6: Initialize threat detector
  console.log('6. Initializing AI threat detector...');
  const detector = new ThreatDetector();
  console.log('✅ Threat detector ready\n');

  // Step 7: Lock wallet
  console.log('7. Locking wallet...');
  await wallet.lock();
  console.log('✅ Wallet locked\n');

  // Step 8: Unlock wallet
  console.log('8. Unlocking wallet...');
  await wallet.unlock(password);
  console.log('✅ Wallet unlocked\n');

  console.log('Example completed successfully!');
}

main().catch(console.error);
