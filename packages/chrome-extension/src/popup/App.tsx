import React, { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';

interface WalletState {
  connected: boolean;
  publicKey: string | null;
  balance: number;
  loading: boolean;
}

interface Transaction {
  signature: string;
  timestamp: number;
  type: string;
  amount: number;
  status: string;
}

const App: React.FC = () => {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    publicKey: null,
    balance: 0,
    loading: true
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'wallet' | 'security' | 'settings'>('wallet');

  useEffect(() => {
    loadWalletState();
  }, []);

  const loadWalletState = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_WALLET_INFO',
        data: { walletId: 'default' }
      });

      if (response.success) {
        setWallet({
          connected: true,
          publicKey: response.publicKey,
          balance: response.balance,
          loading: false
        });
      } else {
        setWallet(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error loading wallet:', error);
      setWallet(prev => ({ ...prev, loading: false }));
    }
  };

  const handleConnect = async () => {
    setWallet(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'CREATE_WALLET',
        data: { password: 'temp_password' }
      });

      if (response.success) {
        await loadWalletState();
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setWallet(prev => ({ ...prev, loading: false }));
    }
  };

  const handleRefresh = async () => {
    await loadWalletState();
  };

  const renderWalletTab = () => (
    <div className="wallet-tab">
      {!wallet.connected ? (
        <div className="connect-section">
          <h2>Welcome to Chain Guard</h2>
          <p>AI-powered security for your Solana wallet</p>
          <button onClick={handleConnect} disabled={wallet.loading}>
            {wallet.loading ? 'Connecting...' : 'Create Wallet'}
          </button>
          <button className="secondary">Import Wallet</button>
        </div>
      ) : (
        <div className="wallet-info">
          <div className="balance-section">
            <h3>Balance</h3>
            <div className="balance">{wallet.balance.toFixed(4)} SOL</div>
            <button onClick={handleRefresh}>Refresh</button>
          </div>

          <div className="address-section">
            <h4>Your Address</h4>
            <div className="address">{wallet.publicKey?.slice(0, 8)}...{wallet.publicKey?.slice(-8)}</div>
            <button onClick={() => navigator.clipboard.writeText(wallet.publicKey || '')}>
              Copy
            </button>
          </div>

          <div className="actions">
            <button className="primary">Send</button>
            <button className="primary">Receive</button>
            <button className="secondary">Swap</button>
          </div>

          <div className="transactions">
            <h4>Recent Transactions</h4>
            {transactions.length === 0 ? (
              <p className="empty">No transactions yet</p>
            ) : (
              <ul>
                {transactions.map(tx => (
                  <li key={tx.signature}>
                    <span>{tx.type}</span>
                    <span>{tx.amount} SOL</span>
                    <span className={`status ${tx.status}`}>{tx.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderSecurityTab = () => (
    <div className="security-tab">
      <h2>Security Dashboard</h2>
      
      <div className="security-score">
        <div className="score-circle">
          <span className="score">95</span>
          <span className="label">Security Score</span>
        </div>
      </div>

      <div className="security-features">
        <div className="feature">
          <h4>🛡️ AI Threat Detection</h4>
          <p>Real-time transaction analysis</p>
          <span className="status active">Active</span>
        </div>

        <div className="feature">
          <h4>🔒 Encryption</h4>
          <p>AES-256-GCM encryption</p>
          <span className="status active">Enabled</span>
        </div>

        <div className="feature">
          <h4>⚠️ Risk Alerts</h4>
          <p>Instant notifications</p>
          <span className="status active">Enabled</span>
        </div>

        <div className="feature">
          <h4>📊 Transaction Monitoring</h4>
          <p>24/7 blockchain monitoring</p>
          <span className="status active">Active</span>
        </div>
      </div>

      <div className="recent-alerts">
        <h4>Recent Alerts</h4>
        <p className="empty">No security alerts</p>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="settings-tab">
      <h2>Settings</h2>

      <div className="setting-group">
        <h4>Network</h4>
        <select defaultValue="mainnet">
          <option value="mainnet">Mainnet Beta</option>
          <option value="testnet">Testnet</option>
          <option value="devnet">Devnet</option>
        </select>
      </div>

      <div className="setting-group">
        <h4>RPC Endpoint</h4>
        <input type="text" placeholder="https://api.mainnet-beta.solana.com" />
      </div>

      <div className="setting-group">
        <h4>Security Level</h4>
        <select defaultValue="high">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="paranoid">Paranoid</option>
        </select>
      </div>

      <div className="setting-group">
        <h4>Auto-lock</h4>
        <select defaultValue="5">
          <option value="1">1 minute</option>
          <option value="5">5 minutes</option>
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="never">Never</option>
        </select>
      </div>

      <div className="danger-zone">
        <h4>Danger Zone</h4>
        <button className="danger">Export Private Key</button>
        <button className="danger">Reset Wallet</button>
      </div>
    </div>
  );

  return (
    <div className="app">
      <header>
        <h1>Chain Guard</h1>
        <div className="network-indicator">
          <span className="dot"></span>
          Mainnet
        </div>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'wallet' ? 'active' : ''}
          onClick={() => setActiveTab('wallet')}
        >
          Wallet
        </button>
        <button
          className={activeTab === 'security' ? 'active' : ''}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </nav>

      <main>
        {activeTab === 'wallet' && renderWalletTab()}
        {activeTab === 'security' && renderSecurityTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </main>

      <footer>
        <span>Chain Guard v0.1.0</span>
        <a href="https://chainguard.io" target="_blank" rel="noopener noreferrer">
          Documentation
        </a>
      </footer>
    </div>
  );
};

export default App;
