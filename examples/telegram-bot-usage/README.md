# Telegram Bot Usage Example

Learn how to use Chain Guard via Telegram for secure wallet management on the go.

## Getting Started

1. Open Telegram
2. Search for `@chainguard_bot`
3. Start a conversation with `/start`

## Available Commands

### Wallet Management
- `/wallet` - View wallet information
- `/balance` - Check your balance
- `/create` - Create a new wallet
- `/import` - Import existing wallet
- `/export` - Export wallet (encrypted)

### Transactions
- `/send <address> <amount>` - Send SOL
- `/history` - View transaction history
- `/pending` - Check pending transactions

### Security
- `/security` - Security settings
- `/alerts` - View security alerts
- `/2fa` - Enable/disable 2FA
- `/whitelist` - Manage trusted addresses

### AI Features
- `/analyze` - Analyze a transaction
- `/risk <address>` - Check address risk score
- `/scan` - Scan for threats

### Help
- `/help` - Show all commands
- `/support` - Contact support

## Security Features

### Two-Factor Authentication
Enable 2FA for enhanced security:
```
/2fa enable
```

### Transaction Alerts
Get notified of all transactions:
```
/alerts on
```

### Risk Analysis
Check any address before sending:
```
/risk 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

## Example Workflow

### Creating a Wallet
1. `/create` - Bot generates a new wallet
2. Save your seed phrase securely
3. Confirm you've saved it
4. Start using your wallet

### Sending SOL
1. `/send 9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin 1.5`
2. Review transaction details
3. Check AI security analysis
4. Confirm or cancel

### Checking Security
1. `/security` - View security dashboard
2. Enable recommended features
3. Review recent alerts
4. Update settings as needed

## Best Practices

1. **Never share your seed phrase** - Not even with the bot
2. **Enable 2FA** - Extra layer of security
3. **Use private chats** - Don't use bot in groups
4. **Verify addresses** - Always double-check
5. **Start with small amounts** - Test before large transfers
6. **Keep bot updated** - Use latest version

## Privacy

Chain Guard Telegram bot:
- ✅ End-to-end encrypted messages
- ✅ No storage of private keys
- ✅ No tracking or analytics
- ✅ Open source code
- ❌ Never asks for seed phrases in chat

## Troubleshooting

### Bot not responding
- Check your internet connection
- Try `/start` to restart
- Contact support if issue persists

### Transaction failed
- Check your balance
- Verify recipient address
- Review security warnings
- Try again with lower amount

### Can't import wallet
- Verify seed phrase is correct
- Check for extra spaces
- Ensure 12 or 24 words
- Contact support if needed

## Advanced Features

### Scheduled Transactions
```
/schedule send <address> <amount> <date>
```

### Multi-signature
```
/multisig create <threshold> <signers>
```

### Portfolio Tracking
```
/portfolio
```

## Support

Need help?
- `/support` - In-bot support
- Email: support@chainguard.io
- Discord: https://discord.gg/chainguard
- Twitter: @ChainGuardDFI

## Security Notice

⚠️ Always verify you're talking to the official bot:
- Username: `@chainguard_bot`
- Verified badge: ✓
- Bot ID: Check in bot info

Report suspicious bots to: security@chainguard.io
