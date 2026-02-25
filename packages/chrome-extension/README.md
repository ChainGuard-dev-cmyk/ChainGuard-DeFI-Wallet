# Chain Guard Chrome Extension

Browser extension for real-time transaction monitoring and wallet protection on Solana.

## Features

- Real-time transaction interception and analysis
- AI-powered threat detection before transaction signing
- Wallet connection management
- Transaction history and analytics
- Custom security rules and alerts

## Architecture

### Background Service Worker
Handles persistent connections, RPC communication, and background processing.

### Content Scripts
Injected into web pages to intercept wallet interactions and dApp communications.

### Popup Interface
User interface for wallet management, settings, and transaction review.

## Installation

1. Build the extension:
```bash
cd packages/chrome-extension
npm install
npm run build
```

2. Load in Chrome:
- Navigate to `chrome://extensions`
- Enable Developer Mode
- Click "Load unpacked"
- Select the `dist` directory

## Development

```bash
npm run dev    # Watch mode
npm run build  # Production build
npm run test   # Run tests
```

## Security

The extension implements multiple security layers:
- Content Security Policy (CSP)
- Isolated execution contexts
- Encrypted local storage
- Secure message passing between contexts

## Permissions

Required permissions:
- `activeTab` - Access current tab for dApp interaction
- `storage` - Store encrypted wallet data
- `alarms` - Background threat database updates
- `webRequest` - Monitor and analyze RPC calls
