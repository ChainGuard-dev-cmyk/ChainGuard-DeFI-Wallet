import { PublicKey } from '@solana/web3.js';
import * as bip39 from 'bip39';

export class Validators {
  static isValidSolanaAddress(address: string): boolean {
    try {
      const publicKey = new PublicKey(address);
      return PublicKey.isOnCurve(publicKey.toBytes());
    } catch {
      return false;
    }
  }

  static isValidMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  static isValidPrivateKey(privateKey: string): boolean {
    try {
      const decoded = Buffer.from(privateKey, 'base64');
      return decoded.length === 64;
    } catch {
      return false;
    }
  }

  static isValidAmount(amount: string | number): boolean {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return !isNaN(num) && num > 0 && isFinite(num);
  }

  static isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): boolean {
    return password.length >= 8;
  }

  static isStrongPassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return (
      password.length >= 12 &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  }

  static isValidSignature(signature: string): boolean {
    try {
      const decoded = Buffer.from(signature, 'base64');
      return decoded.length === 64;
    } catch {
      return false;
    }
  }

  static isValidBlockhash(blockhash: string): boolean {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(blockhash);
  }

  static isValidSlot(slot: number): boolean {
    return Number.isInteger(slot) && slot >= 0;
  }

  static isValidTimestamp(timestamp: number): boolean {
    return Number.isInteger(timestamp) && timestamp > 0 && timestamp < Date.now() + 86400000;
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  static validateTransactionAmount(amount: number, balance: number): {
    valid: boolean;
    error?: string;
  } {
    if (!this.isValidAmount(amount)) {
      return { valid: false, error: 'Invalid amount' };
    }

    if (amount > balance) {
      return { valid: false, error: 'Insufficient balance' };
    }

    if (amount < 0.000001) {
      return { valid: false, error: 'Amount too small' };
    }

    return { valid: true };
  }

  static validateDerivationPath(path: string): boolean {
    const pathRegex = /^m(\/\d+'?)+$/;
    return pathRegex.test(path);
  }

  static isValidTokenMint(mint: string): boolean {
    return this.isValidSolanaAddress(mint);
  }

  static isValidDecimals(decimals: number): boolean {
    return Number.isInteger(decimals) && decimals >= 0 && decimals <= 18;
  }

  static validateSlippage(slippage: number): boolean {
    return slippage >= 0 && slippage <= 100;
  }

  static isValidPriorityFee(fee: number): boolean {
    return fee >= 0 && fee <= 1000000;
  }

  static validateRpcEndpoint(endpoint: string): {
    valid: boolean;
    error?: string;
  } {
    if (!this.isValidUrl(endpoint)) {
      return { valid: false, error: 'Invalid URL format' };
    }

    const url = new URL(endpoint);
    if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
      return { valid: false, error: 'HTTPS required for remote endpoints' };
    }

    return { valid: true };
  }

  static isValidNetwork(network: string): boolean {
    const validNetworks = ['mainnet-beta', 'testnet', 'devnet', 'localnet'];
    return validNetworks.includes(network);
  }

  static validateWalletName(name: string): {
    valid: boolean;
    error?: string;
  } {
    if (name.length === 0) {
      return { valid: false, error: 'Name cannot be empty' };
    }

    if (name.length > 50) {
      return { valid: false, error: 'Name too long (max 50 characters)' };
    }

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
      return { valid: false, error: 'Name contains invalid characters' };
    }

    return { valid: true };
  }
}

export default Validators;
