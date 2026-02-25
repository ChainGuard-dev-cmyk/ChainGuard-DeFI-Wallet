# Chrome Extension Integration Example

This example shows how to integrate Chain Guard into your dApp to provide security features for your users.

## Features

- Automatic transaction interception
- Real-time threat analysis
- User-friendly security warnings
- Seamless wallet integration

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the example:
```bash
npm run build
```

3. Load the extension in Chrome:
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory

## Usage

### Detecting Chain Guard

```typescript
if (window.solana?.isChainGuard) {
  console.log('Chain Guard detected!');
}
```

### Connecting to Wallet

```typescript
const response = await window.solana.connect();
console.log('Connected:', response.publicKey.toString());
```

### Signing Transactions

```typescript
const transaction = new Transaction();
// ... add instructions

const signed = await window.solana.signTransaction(transaction);
```

### Listening to Events

```typescript
window.solana.on('connect', (publicKey) => {
  console.log('Wallet connected:', publicKey.toString());
});

window.solana.on('disconnect', () => {
  console.log('Wallet disconnected');
});
```

## Security Features

Chain Guard automatically:
- Analyzes all transactions before signing
- Blocks high-risk transactions
- Warns users about suspicious activity
- Provides detailed security reports

## Best Practices

1. Always check for Chain Guard presence
2. Handle connection errors gracefully
3. Provide clear transaction details to users
4. Respect user security preferences
5. Test on devnet before mainnet

## API Reference

See the [main documentation](../../docs/api-reference.md) for complete API details.

## Support

For issues or questions:
- GitHub Issues: https://github.com/chainguard/chain-guard/issues
- Discord: https://discord.gg/chainguard
- Email: support@chainguard.io
