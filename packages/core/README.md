# Chain Guard Core

Core functionality for Chain Guard including blockchain interaction, AI threat detection, and cryptographic operations.

## Modules

### AI Module
- `ml-model.ts` - Machine learning model for transaction analysis
- `threat-detector.ts` - Real-time threat detection engine

### Blockchain Module
- `rpc-client.ts` - Solana RPC client with connection pooling
- `program-parser.ts` - Smart contract instruction parser

### Wallet Module
- `solana-wallet.ts` - Wallet management and key derivation
- `transaction-builder.ts` - Transaction construction and signing

### Crypto Module
- `encryption.ts` - AES-256-GCM encryption implementation
- `key-manager.ts` - Secure key storage and rotation

## Usage

```typescript
import { SolanaWallet } from '@chain-guard/core/wallet';
import { ThreatDetector } from '@chain-guard/core/ai';

const wallet = new SolanaWallet();
const detector = new ThreatDetector();
```
