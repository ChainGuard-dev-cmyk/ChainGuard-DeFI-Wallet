# Changelog

All notable changes to Chain Guard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project structure with monorepo setup
- Core wallet functionality with BIP39/BIP44 support
- AI-powered threat detection system
- ML model for transaction risk scoring
- Chrome extension with popup UI and content scripts
- Telegram bot with wallet management
- Transaction builder with fluent API
- RPC client with connection pooling and failover
- Comprehensive encryption and key management
- Program parser for Solana instructions
- Transaction analyzer in Python
- Security handlers for 2FA and alerts
- Comprehensive test suite
- CI/CD pipelines for testing and security scanning
- Documentation for API, architecture, and security

### Security
- AES-256-GCM encryption for private keys
- PBKDF2 key derivation with 100,000 iterations
- Secure memory wiping after key usage
- Rate limiting for API endpoints
- Content Security Policy for extension
- Automated security scanning in CI/CD

## [0.1.0] - 2024-01-15

### Added
- Initial release
- Basic wallet functionality
- Transaction signing
- Chrome extension MVP
- Telegram bot MVP

[Unreleased]: https://github.com/chainguard/chain-guard/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/chainguard/chain-guard/releases/tag/v0.1.0
