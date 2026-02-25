# Chain Guard Telegram Bot

Telegram bot interface for Chain Guard wallet management and transaction monitoring.

## Features

- Wallet creation and import via Telegram
- Transaction signing with 2FA
- Real-time transaction alerts
- Portfolio tracking
- AI-powered security recommendations
- Multi-language support

## Commands

- `/start` - Initialize bot and create wallet
- `/wallet` - View wallet information
- `/balance` - Check current balance
- `/send` - Send SOL or tokens
- `/history` - View transaction history
- `/security` - Security settings and alerts
- `/help` - Show all commands

## Setup

1. Create a bot with @BotFather on Telegram
2. Get your bot token
3. Configure environment variables:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token
ENCRYPTION_KEY=your_encryption_key
RPC_ENDPOINT=https://api.mainnet-beta.solana.com
```

4. Start the bot:

```bash
npm install
npm run start
```

## Architecture

### Handlers
- `wallet.handler.ts` - Wallet operations
- `ai.handler.ts` - AI analysis and recommendations
- `transaction.handler.ts` - Transaction management
- `security.handler.ts` - Security features

### Security

- End-to-end encryption for private keys
- 2FA for transaction signing
- Rate limiting and anti-spam
- Secure session management
- Encrypted database storage

## Development

```bash
npm run dev     # Development mode with hot reload
npm run build   # Production build
npm run test    # Run tests
npm run lint    # Lint code
```

## Deployment

Supports deployment to:
- Heroku
- AWS Lambda
- Google Cloud Functions
- Self-hosted servers

See `deployment/` directory for platform-specific guides.
