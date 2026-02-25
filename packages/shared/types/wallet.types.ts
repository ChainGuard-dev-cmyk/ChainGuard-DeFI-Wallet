export interface Wallet {
  id: string;
  publicKey: string;
  name: string;
  network: Network;
  createdAt: number;
  lastUsed: number;
  encrypted: boolean;
  derivationPath: string;
}

export enum Network {
  MAINNET = 'mainnet-beta',
  TESTNET = 'testnet',
  DEVNET = 'devnet',
  LOCALNET = 'localnet'
}

export interface WalletBalance {
  sol: number;
  tokens: TokenBalance[];
  nfts: NFTBalance[];
  totalValueUsd: number;
}

export interface TokenBalance {
  mint: string;
  symbol: string;
  name: string;
  amount: number;
  decimals: number;
  uiAmount: number;
  valueUsd: number;
  logoUri?: string;
}

export interface NFTBalance {
  mint: string;
  name: string;
  symbol: string;
  uri: string;
  collection?: string;
  verified: boolean;
}

export interface WalletAccount {
  address: string;
  lamports: number;
  owner: string;
  executable: boolean;
  rentEpoch: number;
  data: string;
}

export interface DerivedAccount {
  index: number;
  publicKey: string;
  derivationPath: string;
  balance: number;
  hasActivity: boolean;
}

export interface WalletSettings {
  autoLockMinutes: number;
  showTestNetworks: boolean;
  defaultNetwork: Network;
  rpcEndpoint: string;
  confirmationLevel: 'processed' | 'confirmed' | 'finalized';
  priorityFee: number;
  slippageTolerance: number;
}

export interface WalletMetadata {
  version: string;
  createdWith: 'extension' | 'telegram' | 'mobile';
  lastBackup?: number;
  securityLevel: 'low' | 'medium' | 'high' | 'paranoid';
  twoFactorEnabled: boolean;
}

export interface KeyPairData {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

export interface MnemonicData {
  phrase: string;
  wordCount: 12 | 24;
  language: string;
  entropy: string;
}

export interface WalletExport {
  version: string;
  wallet: Wallet;
  encryptedData: string;
  checksum: string;
  exportedAt: number;
}

export interface WalletImport {
  type: 'mnemonic' | 'privateKey' | 'ledger' | 'export';
  data: string;
  password?: string;
  derivationPath?: string;
}

export interface SignatureRequest {
  id: string;
  wallet: string;
  message: string | Uint8Array;
  timestamp: number;
  origin?: string;
  approved?: boolean;
}

export interface TransactionRequest {
  id: string;
  wallet: string;
  transaction: any;
  timestamp: number;
  origin?: string;
  approved?: boolean;
  riskScore?: number;
}
