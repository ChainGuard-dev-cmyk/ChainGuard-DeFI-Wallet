# Chain Guard Architecture

## Overview

Chain Guard is a multi-platform security solution for Solana blockchain interactions, built as a monorepo with shared core functionality.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interfaces                       │
├──────────────────────┬──────────────────────────────────┤
│  Chrome Extension    │     Telegram Bot                 │
│  - Popup UI          │     - Command Handlers           │
│  - Content Scripts   │     - Inline Keyboards           │
│  - Service Worker    │     - Session Management         │
└──────────────────────┴──────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    Core Package                          │
├─────────────────────────────────────────────────────────┤
│  AI Module                                               │
│  - ML Model (Neural Network)                            │
│  - Threat Detector                                       │
│  - Risk Scoring Engine                                   │
├─────────────────────────────────────────────────────────┤
│  Blockchain Module                                       │
│  - RPC Client (Connection Pooling)                      │
│  - Transaction Analyzer                                  │
│  - Program Parser                                        │
├─────────────────────────────────────────────────────────┤
│  Wallet Module                                           │
│  - Solana Wallet                                         │
│  - Transaction Builder                                   │
│  - Key Derivation                                        │
├─────────────────────────────────────────────────────────┤
│  Crypto Module                                           │
│  - Encryption Service (AES-256-GCM)                     │
│  - Key Manager                                           │
│  - Secure Storage                                        │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 External Services                        │
├─────────────────────────────────────────────────────────┤
│  - Solana RPC Nodes                                     │
│  - Threat Intelligence API                              │
│  - Token Metadata Service                               │
│  - Price Oracles                                         │
└─────────────────────────────────────────────────────────┘
```

## Component Details

### Chrome Extension

#### Service Worker
- Persistent background process
- Message routing between components
- RPC connection management
- Threat detection coordination
- Transaction interception

#### Content Scripts
- Injected into web pages
- Intercepts wallet provider calls
- Monitors dApp interactions
- Injects security warnings

#### Popup UI
- React-based interface
- Wallet management
- Transaction review
- Security dashboard

### Telegram Bot

#### Architecture
- Node.js with node-telegram-bot-api
- Stateful session management
- Command-based interface
- Inline keyboard navigation

#### Handlers
- Wallet operations
- Transaction management
- AI analysis requests
- Security settings

### Core Package

#### AI Module

**ML Model**
- Neural network architecture: 10 → 64 → 32 → 16 → 1
- Input features: transaction metadata
- Output: risk score (0-1)
- Training: supervised learning on labeled dataset

**Threat Detector**
- Real-time transaction analysis
- Pattern matching
- Blacklist verification
- Honeypot detection
- Flash loan attack identification

#### Blockchain Module

**RPC Client**
- Connection pooling
- Automatic failover
- Health monitoring
- Load balancing
- Retry logic with exponential backoff

**Transaction Analyzer**
- Instruction parsing
- Program identification
- Data extraction
- Complexity scoring

#### Wallet Module

**Solana Wallet**
- BIP39 mnemonic generation
- BIP44 key derivation (m/44'/501'/0'/0')
- Transaction signing
- Balance queries
- Multi-account support

**Transaction Builder**
- Fluent API for transaction construction
- Support for system transfers
- Token transfers
- Custom instructions

#### Crypto Module

**Encryption Service**
- Algorithm: AES-256-GCM
- Key derivation: PBKDF2 (100,000 iterations)
- Authenticated encryption
- Secure random generation

**Key Manager**
- Encrypted storage
- Memory protection
- Key rotation
- Export/import functionality

## Data Flow

### Transaction Signing Flow

```
1. User initiates transaction
   ↓
2. Content script intercepts
   ↓
3. Service worker receives request
   ↓
4. Threat detector analyzes
   ↓
5. ML model scores risk
   ↓
6. If safe: proceed to signing
   If risky: show warning
   If dangerous: block
   ↓
7. User confirms/rejects
   ↓
8. Transaction signed and broadcast
```

### Wallet Creation Flow

```
1. User requests new wallet
   ↓
2. Generate 24-word mnemonic
   ↓
3. Derive keypair from seed
   ↓
4. Encrypt private key
   ↓
5. Store in secure storage
   ↓
6. Display mnemonic to user
   ↓
7. User confirms backup
```

## Security Considerations

### Threat Model

**Assumptions**
- User's device may be compromised
- Network traffic may be monitored
- RPC endpoints may be malicious
- dApps may be phishing attempts

**Mitigations**
- End-to-end encryption
- Zero-knowledge architecture
- Multi-layer threat detection
- User confirmation for sensitive operations

### Attack Vectors

1. **Phishing**
   - Mitigation: Domain verification, visual indicators

2. **Man-in-the-middle**
   - Mitigation: TLS, certificate pinning

3. **Malicious contracts**
   - Mitigation: AI analysis, blacklists

4. **Social engineering**
   - Mitigation: Education, warnings

## Performance

### Metrics

- Transaction analysis: < 100ms
- ML inference: < 50ms
- RPC latency: 100-300ms (network dependent)
- Encryption/decryption: < 10ms

### Optimization

- Connection pooling
- Caching of analysis results
- Lazy loading of ML models
- Efficient data structures

## Scalability

### Horizontal Scaling

- Stateless service workers
- Distributed RPC endpoints
- CDN for static assets

### Vertical Scaling

- Optimized algorithms
- Memory management
- Efficient data serialization

## Monitoring

### Metrics Collected

- Transaction analysis success rate
- False positive rate
- RPC endpoint health
- User engagement
- Error rates

### Logging

- Structured logging
- Privacy-preserving (no PII)
- Centralized log aggregation
- Real-time alerting

## Future Enhancements

1. Hardware wallet integration
2. Multi-chain support
3. Advanced ML models
4. Social recovery
5. Gasless transactions
6. Cross-chain bridges
