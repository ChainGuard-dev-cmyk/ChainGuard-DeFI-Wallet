# Chain Guard Examples

This directory contains practical examples demonstrating how to use Chain Guard in your applications.

## Available Examples

### Basic Wallet
`basic-wallet/` - Learn how to create a wallet, manage keys, and check balances.

```bash
cd examples/basic-wallet
npm install
npm start
```

### Transaction Analysis
`transaction-analysis/` - Analyze transactions for security threats before signing.

```bash
cd examples/transaction-analysis
npm install
npm start
```

### Chrome Extension Integration
`chrome-extension-integration/` - Integrate Chain Guard into your dApp.

```bash
cd examples/chrome-extension-integration
npm install
npm run dev
```

### Telegram Bot Usage
`telegram-bot-usage/` - Use Chain Guard via Telegram bot.

See the README in the telegram-bot-usage directory for setup instructions.

### Advanced Security
`advanced-security/` - Implement advanced security features like 2FA and custom risk rules.

```bash
cd examples/advanced-security
npm install
npm start
```

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Solana CLI (for some examples)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Navigate to an example directory
4. Follow the example-specific README

## Common Setup

Most examples require environment variables:

```bash
# .env
SOLANA_NETWORK=devnet
RPC_ENDPOINT=https://api.devnet.solana.com
```

## Documentation

For detailed API documentation, see:
- [API Reference](../docs/api-reference.md)
- [Architecture](../docs/architecture.md)
- [Security Model](../docs/security-model.md)

## Support

If you encounter issues:
1. Check the example's README
2. Review the main documentation
3. Open an issue on GitHub
4. Join our Discord community

## Contributing

Want to add an example? See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.
