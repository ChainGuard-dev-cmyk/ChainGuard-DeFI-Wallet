import { ThreatDetector } from '@chain-guard/core/ai/threat-detector';
import { RPCClient } from '@chain-guard/core/blockchain/rpc-client';
import { SolanaWallet } from '@chain-guard/core/wallet/solana-wallet';

interface MessageHandler {
  type: string;
  handler: (data: any, sender: chrome.runtime.MessageSender) => Promise<any>;
}

class ServiceWorker {
  private threatDetector: ThreatDetector;
  private rpcClient: RPCClient;
  private wallets: Map<string, SolanaWallet> = new Map();
  private messageHandlers: Map<string, MessageHandler['handler']> = new Map();

  constructor() {
    this.threatDetector = new ThreatDetector();
    this.rpcClient = new RPCClient({
      endpoints: [
        'https://api.mainnet-beta.solana.com',
        'https://solana-api.projectserum.com',
        'https://rpc.ankr.com/solana'
      ],
      commitment: 'confirmed'
    });

    this.initializeMessageHandlers();
    this.setupListeners();
    this.startBackgroundTasks();
  }

  private initializeMessageHandlers(): void {
    this.messageHandlers.set('ANALYZE_TRANSACTION', this.handleAnalyzeTransaction.bind(this));
    this.messageHandlers.set('SIGN_TRANSACTION', this.handleSignTransaction.bind(this));
    this.messageHandlers.set('GET_WALLET_INFO', this.handleGetWalletInfo.bind(this));
    this.messageHandlers.set('CREATE_WALLET', this.handleCreateWallet.bind(this));
    this.messageHandlers.set('IMPORT_WALLET', this.handleImportWallet.bind(this));
    this.messageHandlers.set('GET_BALANCE', this.handleGetBalance.bind(this));
    this.messageHandlers.set('UPDATE_THREAT_DB', this.handleUpdateThreatDB.bind(this));
  }

  private setupListeners(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender)
        .then(sendResponse)
        .catch(error => {
          console.error('Message handler error:', error);
          sendResponse({ error: error.message });
        });
      return true; // Keep channel open for async response
    });

    chrome.alarms.onAlarm.addListener((alarm) => {
      this.handleAlarm(alarm);
    });

    chrome.webRequest.onBeforeRequest.addListener(
      (details) => this.handleWebRequest(details),
      { urls: ['https://*.solana.com/*', 'https://*.helius-rpc.com/*'] },
      ['requestBody']
    );
  }

  private async handleMessage(
    message: any,
    sender: chrome.runtime.MessageSender
  ): Promise<any> {
    const handler = this.messageHandlers.get(message.type);
    
    if (!handler) {
      throw new Error(`Unknown message type: ${message.type}`);
    }

    return await handler(message.data, sender);
  }

  private async handleAnalyzeTransaction(data: any): Promise<any> {
    const { transaction } = data;
    
    try {
      const analysis = await this.threatDetector.analyzeTransaction(transaction);
      
      // Store analysis in local storage for history
      await this.storeAnalysis(analysis);
      
      return {
        success: true,
        analysis
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  private async handleSignTransaction(data: any): Promise<any> {
    const { walletId, transaction, password } = data;
    
    const wallet = this.wallets.get(walletId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Analyze before signing
    const analysis = await this.threatDetector.analyzeTransaction(transaction);
    
    if (analysis.riskScore > 0.8) {
      return {
        success: false,
        blocked: true,
        reason: 'High risk transaction blocked',
        analysis
      };
    }

    await wallet.unlock(password);
    const signedTx = await wallet.signTransaction(transaction);
    await wallet.lock();

    return {
      success: true,
      signedTransaction: signedTx,
      analysis
    };
  }

  private async handleGetWalletInfo(data: any): Promise<any> {
    const { walletId } = data;
    const wallet = this.wallets.get(walletId);
    
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const publicKey = await wallet.getPublicKey();
    const balance = await wallet.getBalance();

    return {
      success: true,
      publicKey: publicKey.toString(),
      balance
    };
  }

  private async handleCreateWallet(data: any): Promise<any> {
    const { password } = data;
    
    const wallet = new SolanaWallet({
      network: 'mainnet-beta',
      commitment: 'confirmed'
    });

    const mnemonic = await wallet.generateMnemonic();
    await wallet.importFromMnemonic(mnemonic, password);

    const walletId = this.generateWalletId();
    this.wallets.set(walletId, wallet);

    return {
      success: true,
      walletId,
      mnemonic,
      publicKey: (await wallet.getPublicKey()).toString()
    };
  }

  private async handleImportWallet(data: any): Promise<any> {
    const { mnemonic, password } = data;
    
    const wallet = new SolanaWallet({
      network: 'mainnet-beta',
      commitment: 'confirmed'
    });

    await wallet.importFromMnemonic(mnemonic, password);

    const walletId = this.generateWalletId();
    this.wallets.set(walletId, wallet);

    return {
      success: true,
      walletId,
      publicKey: (await wallet.getPublicKey()).toString()
    };
  }

  private async handleGetBalance(data: any): Promise<any> {
    const { walletId } = data;
    const wallet = this.wallets.get(walletId);
    
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const balance = await wallet.getBalance();

    return {
      success: true,
      balance
    };
  }

  private async handleUpdateThreatDB(): Promise<any> {
    await this.threatDetector.updateThreatDatabase();
    
    return {
      success: true,
      message: 'Threat database updated'
    };
  }

  private handleAlarm(alarm: chrome.alarms.Alarm): void {
    if (alarm.name === 'UPDATE_THREAT_DB') {
      this.threatDetector.updateThreatDatabase();
    } else if (alarm.name === 'HEALTH_CHECK') {
      this.performHealthCheck();
    }
  }

  private handleWebRequest(details: chrome.webRequest.WebRequestBodyDetails): void {
    // Monitor RPC requests for suspicious patterns
    if (details.requestBody) {
      console.log('RPC Request intercepted:', details.url);
      // Could analyze request patterns here
    }
  }

  private startBackgroundTasks(): void {
    // Update threat database every 6 hours
    chrome.alarms.create('UPDATE_THREAT_DB', {
      periodInMinutes: 360
    });

    // Health check every 5 minutes
    chrome.alarms.create('HEALTH_CHECK', {
      periodInMinutes: 5
    });
  }

  private async storeAnalysis(analysis: any): Promise<void> {
    const history = await this.getAnalysisHistory();
    history.push({
      ...analysis,
      id: this.generateId(),
      timestamp: Date.now()
    });

    // Keep only last 100 analyses
    if (history.length > 100) {
      history.shift();
    }

    await chrome.storage.local.set({ analysisHistory: history });
  }

  private async getAnalysisHistory(): Promise<any[]> {
    const result = await chrome.storage.local.get('analysisHistory');
    return result.analysisHistory || [];
  }

  private generateWalletId(): string {
    return `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async performHealthCheck(): Promise<void> {
    const stats = this.rpcClient.getEndpointStats();
    const healthyEndpoints = stats.filter(e => e.healthy).length;
    
    if (healthyEndpoints === 0) {
      console.error('All RPC endpoints are unhealthy');
      // Could send notification to user
    }
  }
}

// Initialize service worker
const serviceWorker = new ServiceWorker();

export default serviceWorker;
