export const SOLANA_NETWORKS = {
  MAINNET: {
    name: 'Mainnet Beta',
    id: 'mainnet-beta',
    rpcEndpoints: [
      'https://api.mainnet-beta.solana.com',
      'https://solana-api.projectserum.com',
      'https://rpc.ankr.com/solana'
    ],
    explorerUrl: 'https://solscan.io',
    chainId: 101
  },
  TESTNET: {
    name: 'Testnet',
    id: 'testnet',
    rpcEndpoints: [
      'https://api.testnet.solana.com'
    ],
    explorerUrl: 'https://solscan.io?cluster=testnet',
    chainId: 102
  },
  DEVNET: {
    name: 'Devnet',
    id: 'devnet',
    rpcEndpoints: [
      'https://api.devnet.solana.com'
    ],
    explorerUrl: 'https://solscan.io?cluster=devnet',
    chainId: 103
  },
  LOCALNET: {
    name: 'Localnet',
    id: 'localnet',
    rpcEndpoints: [
      'http://localhost:8899'
    ],
    explorerUrl: 'http://localhost:3000',
    chainId: 104
  }
};

export const DEFAULT_NETWORK = SOLANA_NETWORKS.MAINNET;

export const KNOWN_PROGRAMS = {
  SYSTEM_PROGRAM: '11111111111111111111111111111111',
  TOKEN_PROGRAM: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  ASSOCIATED_TOKEN_PROGRAM: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  SERUM_DEX_V3: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin',
  RAYDIUM_AMM: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
  ORCA_WHIRLPOOL: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc'
};

export const LAMPORTS_PER_SOL = 1000000000;

export const DEFAULT_COMMITMENT = 'confirmed';

export const TRANSACTION_TIMEOUT = 60000; // 60 seconds

export const MAX_RETRIES = 3;

export const RATE_LIMITS = {
  RPC_REQUESTS: {
    maxRequests: 100,
    windowMs: 60000 // 1 minute
  },
  THREAT_ANALYSIS: {
    maxRequests: 50,
    windowMs: 60000
  },
  ML_PREDICTIONS: {
    maxRequests: 200,
    windowMs: 60000
  }
};

export default {
  SOLANA_NETWORKS,
  DEFAULT_NETWORK,
  KNOWN_PROGRAMS,
  LAMPORTS_PER_SOL,
  DEFAULT_COMMITMENT,
  TRANSACTION_TIMEOUT,
  MAX_RETRIES,
  RATE_LIMITS
};
