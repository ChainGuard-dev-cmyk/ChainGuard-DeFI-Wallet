import { Keypair, PublicKey, Connection, Transaction } from '@solana/web3.js';
import { derivePath } from 'ed25519-hd-key';
import * as bip39 from 'bip39';
import { KeyManager } from '../crypto/key-manager';
import { EncryptionService } from '../crypto/encryption';

export interface WalletConfig {
  network: 'mainnet-beta' | 'testnet' | 'devnet';
  rpcEndpoint?: string;
  commitment?: 'processed' | 'confirmed' | 'finalized';
}

export class SolanaWallet {
  private keypair: Keypair | null = null;
  private connection: Connection;
  private keyManager: KeyManager;
  private encryptionService: EncryptionService;
  private derivationPath: string = "m/44'/501'/0'/0'";

  constructor(config: WalletConfig) {
    const endpoint = config.rpcEndpoint || this.getDefaultEndpoint(config.network);
    this.connection = new Connection(endpoint, config.commitment || 'confirmed');
    this.keyManager = new KeyManager();
    this.encryptionService = new EncryptionService();
  }

  private getDefaultEndpoint(network: string): string {
    const endpoints = {
      'mainnet-beta': 'https://api.mainnet-beta.solana.com',
      'testnet': 'https://api.testnet.solana.com',
      'devnet': 'https://api.devnet.solana.com'
    };
    return endpoints[network] || endpoints['mainnet-beta'];
  }

  async generateMnemonic(): Promise<string> {
    const mnemonic = bip39.generateMnemonic(256);
    return mnemonic;
  }

  async importFromMnemonic(mnemonic: string, password: string): Promise<void> {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    const seed = await bip39.mnemonicToSeed(mnemonic);
    const derivedSeed = derivePath(this.derivationPath, seed.toString('hex')).key;
    this.keypair = Keypair.fromSeed(derivedSeed);

    await this.keyManager.storeKey(
      this.keypair.secretKey,
      password,
      this.encryptionService
    );
  }

  async getPublicKey(): Promise<PublicKey> {
    if (!this.keypair) {
      throw new Error('Wallet not initialized');
    }
    return this.keypair.publicKey;
  }

  async getBalance(): Promise<number> {
    if (!this.keypair) {
      throw new Error('Wallet not initialized');
    }
    const balance = await this.connection.getBalance(this.keypair.publicKey);
    return balance / 1e9; // Convert lamports to SOL
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.keypair) {
      throw new Error('Wallet not initialized');
    }
    transaction.sign(this.keypair);
    return transaction;
  }

  async sendTransaction(transaction: Transaction): Promise<string> {
    if (!this.keypair) {
      throw new Error('Wallet not initialized');
    }

    const signedTx = await this.signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(
      signedTx.serialize(),
      { skipPreflight: false, preflightCommitment: 'confirmed' }
    );

    await this.connection.confirmTransaction(signature, 'confirmed');
    return signature;
  }

  async deriveAddress(index: number): Promise<PublicKey> {
    if (!this.keypair) {
      throw new Error('Wallet not initialized');
    }
    const path = `m/44'/501'/${index}'/0'`;
    const seed = await bip39.mnemonicToSeed(''); // Would use stored mnemonic
    const derivedSeed = derivePath(path, seed.toString('hex')).key;
    const derivedKeypair = Keypair.fromSeed(derivedSeed);
    return derivedKeypair.publicKey;
  }

  async lock(): Promise<void> {
    this.keypair = null;
    await this.keyManager.clearMemory();
  }

  async unlock(password: string): Promise<void> {
    const secretKey = await this.keyManager.retrieveKey(password, this.encryptionService);
    this.keypair = Keypair.fromSecretKey(secretKey);
  }
}
