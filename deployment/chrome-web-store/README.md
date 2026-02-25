# Chrome Web Store Deployment

Guide for deploying Chain Guard extension to the Chrome Web Store.

## Prerequisites

- Chrome Web Store Developer account
- Extension ID from Chrome Web Store
- API credentials for automated uploads

## Build for Production

```bash
cd packages/chrome-extension
npm run build:production
```

This creates an optimized build in `dist/` directory.

## Manual Upload

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Select your extension
3. Click "Package" tab
4. Upload the `dist.zip` file
5. Fill in store listing details
6. Submit for review

## Automated Deployment

Using the Chrome Web Store API:

```bash
export CLIENT_ID="your_client_id"
export CLIENT_SECRET="your_client_secret"
export REFRESH_TOKEN="your_refresh_token"
export EXTENSION_ID="your_extension_id"

./deploy.sh
```

## Store Listing

### Title
Chain Guard - Smart Wallet Security for Solana

### Short Description
AI-powered security for your Solana wallet. Real-time threat detection and transaction analysis.

### Detailed Description
Chain Guard provides advanced security features for Solana blockchain users:

- Real-time transaction analysis
- AI-powered threat detection
- Honeypot and rug pull detection
- Flash loan attack prevention
- Blacklist verification
- User-friendly security warnings

### Category
Productivity

### Language
English

### Screenshots
Required sizes:
- 1280x800 (main screenshot)
- 640x400 (additional screenshots)

### Privacy Policy
https://chainguard.io/privacy

### Support URL
https://chainguard.io/support

## Review Process

Typical review time: 1-3 business days

Common rejection reasons:
- Missing privacy policy
- Unclear permissions usage
- Security vulnerabilities
- Misleading descriptions

## Post-Deployment

1. Monitor user reviews
2. Track error reports
3. Update regularly
4. Respond to user feedback

## Versioning

Follow semantic versioning:
- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes

Example: 1.2.3

## Rollback

If issues are found:

1. Go to Developer Dashboard
2. Select previous version
3. Click "Rollback"
4. Confirm rollback

## Support

For deployment issues:
- Email: chrome@chainguard.io
- Documentation: https://chainguard.io/docs/deployment
