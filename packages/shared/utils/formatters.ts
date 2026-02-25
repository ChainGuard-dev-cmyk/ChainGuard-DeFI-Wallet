export class Formatters {
  static formatSolAmount(lamports: number, decimals: number = 4): string {
    const sol = lamports / 1e9;
    return sol.toFixed(decimals);
  }

  static formatTokenAmount(amount: number, decimals: number, displayDecimals: number = 4): string {
    const value = amount / Math.pow(10, decimals);
    return value.toFixed(displayDecimals);
  }

  static formatUsd(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  static formatPercentage(value: number, decimals: number = 2): string {
    return `${value.toFixed(decimals)}%`;
  }

  static formatAddress(address: string, startChars: number = 4, endChars: number = 4): string {
    if (address.length <= startChars + endChars) {
      return address;
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  }

  static formatSignature(signature: string): string {
    return this.formatAddress(signature, 8, 8);
  }

  static formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  }

  static formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  }

  static formatBlockTime(blockTime: number | null): string {
    if (!blockTime) return 'Unknown';
    return this.formatTimestamp(blockTime);
  }

  static formatLargeNumber(num: number): string {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toString();
  }

  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  static formatComputeUnits(units: number): string {
    return this.formatLargeNumber(units);
  }

  static formatSlot(slot: number): string {
    return slot.toLocaleString();
  }

  static formatEpoch(epoch: number): string {
    return `Epoch ${epoch}`;
  }

  static formatTransactionType(type: string): string {
    return type
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  }

  static formatConfirmationStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      processed: '⏳ Processed',
      confirmed: '✓ Confirmed',
      finalized: '✓✓ Finalized'
    };
    return statusMap[status] || status;
  }

  static formatError(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    return 'Unknown error';
  }

  static formatPriorityFee(fee: number): string {
    return `${fee.toLocaleString()} microLamports`;
  }

  static formatGasPrice(price: number): string {
    return `${price} lamports/CU`;
  }

  static formatSlippage(slippage: number): string {
    return `${slippage.toFixed(2)}%`;
  }

  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  static formatRiskScore(score: number): string {
    if (score >= 0.8) return '🔴 High Risk';
    if (score >= 0.5) return '🟡 Medium Risk';
    if (score >= 0.2) return '🟢 Low Risk';
    return '✅ Safe';
  }

  static formatNetworkName(network: string): string {
    const networkNames: { [key: string]: string } = {
      'mainnet-beta': 'Mainnet',
      'testnet': 'Testnet',
      'devnet': 'Devnet',
      'localnet': 'Localnet'
    };
    return networkNames[network] || network;
  }

  static formatAccountType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'system': 'System Account',
      'token': 'Token Account',
      'nft': 'NFT Account',
      'program': 'Program Account'
    };
    return typeMap[type] || type;
  }

  static truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
  }

  static formatMnemonic(mnemonic: string): string {
    const words = mnemonic.split(' ');
    return words.map((word, i) => `${i + 1}. ${word}`).join('\n');
  }

  static formatDerivationPath(path: string): string {
    return path.replace(/'/g, 'ʰ');
  }
}

export default Formatters;
