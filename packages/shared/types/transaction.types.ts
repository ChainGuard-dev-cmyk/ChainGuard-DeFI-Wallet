export interface Transaction {
  signature: string;
  slot: number;
  blockTime: number;
  confirmationStatus: ConfirmationStatus;
  err: TransactionError | null;
  memo: string | null;
  fee: number;
  instructions: ParsedInstruction[];
  accounts: string[];
  recentBlockhash: string;
}

export enum ConfirmationStatus {
  PROCESSED = 'processed',
  CONFIRMED = 'confirmed',
  FINALIZED = 'finalized'
}

export interface TransactionError {
  code: number;
  message: string;
  logs?: string[];
}

export interface ParsedInstruction {
  programId: string;
  program: string;
  type: string;
  info: any;
  accounts: string[];
}

export interface TransactionMetadata {
  computeUnitsConsumed: number;
  logMessages: string[];
  preBalances: number[];
  postBalances: number[];
  preTokenBalances: TokenBalance[];
  postTokenBalances: TokenBalance[];
  rewards: Reward[];
}

export interface TokenBalance {
  accountIndex: number;
  mint: string;
  owner: string;
  uiTokenAmount: {
    amount: string;
    decimals: number;
    uiAmount: number;
    uiAmountString: string;
  };
}

export interface Reward {
  pubkey: string;
  lamports: number;
  postBalance: number;
  rewardType: 'fee' | 'rent' | 'voting' | 'staking';
  commission: number | null;
}

export interface TransactionHistory {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface TransactionFilter {
  address?: string;
  startTime?: number;
  endTime?: number;
  limit?: number;
  before?: string;
  until?: string;
  type?: TransactionType[];
}

export enum TransactionType {
  TRANSFER = 'TRANSFER',
  TOKEN_TRANSFER = 'TOKEN_TRANSFER',
  SWAP = 'SWAP',
  STAKE = 'STAKE',
  UNSTAKE = 'UNSTAKE',
  NFT_MINT = 'NFT_MINT',
  NFT_TRANSFER = 'NFT_TRANSFER',
  PROGRAM_INTERACTION = 'PROGRAM_INTERACTION',
  UNKNOWN = 'UNKNOWN'
}

export interface TransactionBuilder {
  addInstruction(instruction: any): TransactionBuilder;
  addInstructions(instructions: any[]): TransactionBuilder;
  setFeePayer(feePayer: string): TransactionBuilder;
  setRecentBlockhash(blockhash: string): TransactionBuilder;
  build(): any;
}

export interface SignedTransaction {
  transaction: any;
  signatures: Signature[];
  serialized: Uint8Array;
}

export interface Signature {
  publicKey: string;
  signature: Uint8Array;
}

export interface TransactionReceipt {
  signature: string;
  status: 'success' | 'failed' | 'pending';
  confirmations: number;
  blockTime: number;
  fee: number;
  error?: string;
}

export interface PendingTransaction {
  id: string;
  transaction: any;
  status: 'pending' | 'processing' | 'confirming';
  createdAt: number;
  lastChecked: number;
  retries: number;
}

export interface TransactionSimulation {
  success: boolean;
  logs: string[];
  unitsConsumed: number;
  accounts: AccountState[];
  returnData?: {
    programId: string;
    data: string;
  };
  error?: string;
}

export interface AccountState {
  address: string;
  lamports: number;
  data: string;
  owner: string;
  executable: boolean;
}

export interface TransactionCost {
  baseFee: number;
  priorityFee: number;
  computeUnitPrice: number;
  computeUnitLimit: number;
  totalFee: number;
  estimatedFeeUsd: number;
}
