# Chain Guard API Reference

## Core Package

### Wallet Module

#### SolanaWallet

Main wallet class for managing Solana accounts.

```typescript
import { SolanaWallet } from '@chain-guard/core/wallet';

const wallet = new SolanaWallet({
  network: 'mainnet-beta',
  rpcEndpoint: 'https://api.mainnet-beta.solana.com',
  commitment: 'confirmed'
});
```

**Methods:**

##### generateMnemonic()
Generates a new BIP39 mnemonic phrase.

```typescript
const mnemonic = await wallet.generateMnemonic();
// Returns: "word1 word2 word3 ... word24"
```

##### importFromMnemonic(mnemonic, password)
Imports wallet from mnemonic phrase.

```typescript
await wallet.importFromMnemonic(mnemonic, password);
```

##### getPublicKey()
Returns the wallet's public key.

```typescript
const publicKey = await wallet.getPublicKey();
// Returns: PublicKey
```

##### getBalance()
Gets the wallet balance in SOL.

```typescript
const balance = await wallet.getBalance();
// Returns: number (SOL)
```

##### signTransaction(transaction)
Signs a transaction.

```typescript
const signedTx = await wallet.signTransaction(transaction);
// Returns: Transaction
```

##### sendTransaction(transaction)
Signs and sends a transaction.

```typescript
const signature = await wallet.sendTransaction(transaction);
// Returns: string (transaction signature)
```

#### TransactionBuilder

Fluent API for building transactions.

```typescript
import { TransactionBuilder } from '@chain-guard/core/wallet';

const builder = new TransactionBuilder();
```

**Methods:**

##### addTransfer(params)
Adds a SOL transfer instruction.

```typescript
builder.addTransfer({
  from: fromPublicKey,
  to: toPublicKey,
  amount: 1.5 // SOL
});
```

##### addTokenTransfer(params)
Adds a token transfer instruction.

```typescript
builder.addTokenTransfer({
  from: fromPublicKey,
  to: toPublicKey,
  amount: 100,
  mint: tokenMintPublicKey,
  decimals: 9
});
```

##### build()
Builds and returns the transaction.

```typescript
const transaction = builder
  .setFeePayer(feePayerPublicKey)
  .setRecentBlockhash(blockhash)
  .build();
```

### AI Module

#### ThreatDetector

Real-time threat detection for transactions.

```typescript
import { ThreatDetector } from '@chain-guard/core/ai';

const detector = new ThreatDetector();
```

**Methods:**

##### analyzeTransaction(transaction)
Analyzes a transaction for threats.

```typescript
const analysis = await detector.analyzeTransaction(transaction);
// Returns: ThreatAnalysis
```

**ThreatAnalysis Interface:**

```typescript
interface ThreatAnalysis {
  riskScore: number;           // 0-1
  threats: ThreatType[];
  confidence: number;
  recommendations: string[];
  timestamp: number;
}
```

##### addToBlacklist(address)
Adds an address to the blacklist.

```typescript
await detector.addToBlacklist(maliciousAddress);
```

##### updateThreatDatabase()
Updates the threat intelligence database.

```typescript
await detector.updateThreatDatabase();
```

#### MLModel

Machine learning model for risk prediction.

```typescript
import { MLModel } from '@chain-guard/core/ai';

const model = new MLModel();
```

**Methods:**

##### predict(features)
Predicts risk score from features.

```typescript
const prediction = await model.predict(features);
// Returns: PredictionResult
```

**PredictionResult Interface:**

```typescript
interface PredictionResult {
  score: number;        // 0-1
  confidence: number;   // 0-1
  features: number[];
}
```

### Blockchain Module

#### RPCClient

RPC client with connection pooling and failover.

```typescript
import { RPCClient } from '@chain-guard/core/blockchain';

const client = new RPCClient({
  endpoints: [
    'https://api.mainnet-beta.solana.com',
    'https://solana-api.projectserum.com'
  ],
  commitment: 'confirmed',
  maxRetries: 3
});
```

**Methods:**

##### getConnection()
Gets a healthy RPC connection.

```typescript
const connection = client.getConnection();
```

##### executeWithRetry(operation)
Executes an operation with automatic retry.

```typescript
const result = await client.executeWithRetry(async (connection) => {
  return await connection.getBalance(publicKey);
});
```

##### getEndpointStats()
Gets statistics for all endpoints.

```typescript
const stats = client.getEndpointStats();
// Returns: RPCEndpoint[]
```

#### ProgramParser

Parses Solana program instructions.

```typescript
import { ProgramParser } from '@chain-guard/core/blockchain';

const parser = new ProgramParser();
```

**Methods:**

##### parseInstruction(instruction)
Parses a single instruction.

```typescript
const parsed = parser.parseInstruction(instruction);
// Returns: ParsedProgram
```

##### parseMultipleInstructions(instructions)
Parses multiple instructions.

```typescript
const parsed = parser.parseMultipleInstructions(instructions);
// Returns: ParsedProgram[]
```

### Crypto Module

#### EncryptionService

AES-256-GCM encryption service.

```typescript
import { EncryptionService } from '@chain-guard/core/crypto';

const encryption = new EncryptionService();
```

**Methods:**

##### encrypt(data, password)
Encrypts data with password.

```typescript
const encrypted = await encryption.encrypt(dataBuffer, password);
// Returns: EncryptedData
```

##### decrypt(encryptedData, password)
Decrypts data with password.

```typescript
const decrypted = await encryption.decrypt(encryptedData, password);
// Returns: Buffer
```

#### KeyManager

Secure key storage and management.

```typescript
import { KeyManager } from '@chain-guard/core/crypto';

const keyManager = new KeyManager();
```

**Methods:**

##### storeKey(secretKey, password, encryptionService)
Stores an encrypted key.

```typescript
await keyManager.storeKey(secretKey, password, encryptionService);
```

##### retrieveKey(password, encryptionService)
Retrieves and decrypts a key.

```typescript
const secretKey = await keyManager.retrieveKey(password, encryptionService);
```

## Shared Package

### Validators

Input validation utilities.

```typescript
import { Validators } from '@chain-guard/shared/utils';
```

**Methods:**

- `isValidSolanaAddress(address: string): boolean`
- `isValidMnemonic(mnemonic: string): boolean`
- `isValidAmount(amount: string | number): boolean`
- `isStrongPassword(password: string): boolean`
- `validateTransactionAmount(amount: number, balance: number)`

### Formatters

Formatting utilities.

```typescript
import { Formatters } from '@chain-guard/shared/utils';
```

**Methods:**

- `formatSolAmount(lamports: number, decimals?: number): string`
- `formatAddress(address: string, startChars?: number, endChars?: number): string`
- `formatUsd(amount: number): string`
- `formatRelativeTime(timestamp: number): string`

## Chrome Extension

### Message Types

Communication between extension components.

```typescript
// Send message to background script
chrome.runtime.sendMessage({
  type: 'ANALYZE_TRANSACTION',
  data: { transaction }
});

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TRANSACTION_APPROVED') {
    // Handle approval
  }
});
```

**Message Types:**

- `ANALYZE_TRANSACTION` - Analyze transaction for threats
- `SIGN_TRANSACTION` - Sign a transaction
- `GET_WALLET_INFO` - Get wallet information
- `CREATE_WALLET` - Create new wallet
- `IMPORT_WALLET` - Import existing wallet

## Telegram Bot

### Commands

- `/start` - Initialize bot
- `/wallet` - View wallet info
- `/balance` - Check balance
- `/send <address> <amount>` - Send SOL
- `/risk <address>` - Check address risk
- `/analyze` - Analyze transaction

### Callback Data Format

```typescript
// Format: action_parameter
'wallet_create'
'ai_check_address'
'tx_approve_<txId>'
```

## Error Handling

All async methods may throw errors. Always use try-catch:

```typescript
try {
  const balance = await wallet.getBalance();
} catch (error) {
  console.error('Failed to get balance:', error);
}
```

## Rate Limits

- RPC calls: Depends on endpoint
- Threat detection: 100 requests/minute
- ML predictions: 1000 requests/minute

## Best Practices

1. Always validate inputs before processing
2. Use connection pooling for RPC calls
3. Cache analysis results when possible
4. Handle errors gracefully
5. Never log sensitive data
6. Use strong passwords for encryption
7. Regularly update threat database
